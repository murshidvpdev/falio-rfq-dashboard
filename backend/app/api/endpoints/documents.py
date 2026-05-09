from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from typing import Optional

from ...core.database import get_db
from ...core.permissions import require_permission, P
from ...models.user import User
from ...models.document import Document, DocumentLineItem
from ...services import extraction_service, audit_service

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "files" / "uploads"
ALLOWED_SUFFIXES = {".xlsx", ".xls", ".csv", ".pdf", ".doc", ".docx", ".txt"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _ensure_upload_dir():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _doc_to_dict(doc: Document, include_items: bool = False) -> dict:
    d = {
        "id":                doc.id,
        "original_filename": doc.original_filename,
        "file_type":         doc.file_type,
        "file_size":         doc.file_size,
        "status":            doc.status,
        "error_message":     doc.error_message,
        "uploaded_by":       doc.uploader.username if doc.uploader else None,
        "uploaded_at":       doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        "processed_at":      doc.processed_at.isoformat() if doc.processed_at else None,
        "rfq_number":        doc.rfq_number,
        "account":           doc.account,
        "supplier":          doc.supplier,
        "issue_date":        doc.issue_date,
        "due_date":          doc.due_date,
        "total_amount":      doc.total_amount,
        "currency":          doc.currency,
        "total_line_items":  doc.total_line_items,
        # All specific extracted columns
        "rfq_case_id":   doc.rfq_case_id,
        "owner":         doc.owner,
        "address":       doc.address,
        "event_type":    doc.event_type,
        "commodity":     doc.commodity,
        "response_id":   doc.response_id,
        "po_id":         doc.po_id,
        "po_number":     doc.po_number,
        "agreement_no":  doc.agreement_no,
        "contact":       doc.contact,
        "phone":         doc.phone,
        "email":         doc.email,
    }
    if include_items:
        d["line_items"] = [
            {
                "id":          li.id,
                "item_no":     li.item_no,
                "description": li.description,
                "part_number": li.part_number,
                "quantity":    li.quantity,
                "unit":        li.unit,
                "unit_price":  li.unit_price,
                "total_price": li.total_price,
                "notes":       li.notes,
            }
            for li in doc.line_items
        ]
    return d


# ── Upload ────────────────────────────────────────────────────────────────────

@router.post("/upload", status_code=201)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(require_permission(P.FILES_UPLOAD)),
    db: AsyncSession = Depends(get_db),
):
    _ensure_upload_dir()

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            400,
            f"Unsupported file type '{suffix}'. Allowed: {', '.join(sorted(ALLOWED_SUFFIXES))}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large. Maximum size is 20 MB.")

    stored_name = f"{uuid4().hex}{suffix}"
    save_path = UPLOAD_DIR / stored_name
    save_path.write_bytes(content)

    doc = Document(
        original_filename=file.filename,
        stored_filename=stored_name,
        file_type=suffix.lstrip("."),
        file_size=len(content),
        status="Processing",
        uploaded_by=current_user.id,
    )
    db.add(doc)
    await db.flush()

    try:
        extracted = extraction_service.extract(content, suffix, file.filename or "")
        doc.rfq_number      = extracted.get("rfq_number")
        doc.account         = extracted.get("account")
        doc.supplier        = extracted.get("supplier")
        doc.issue_date      = extracted.get("issue_date")
        doc.due_date        = extracted.get("due_date")
        doc.total_amount    = extracted.get("total_amount")
        doc.currency        = extracted.get("currency", "SAR")
        doc.processed_at = datetime.now(timezone.utc)
        doc.status       = "Completed"

        # Map all extracted fields to proper columns
        doc.rfq_case_id  = extracted.get("rfq_case_id")
        doc.owner        = extracted.get("owner")
        doc.address      = extracted.get("address")
        doc.event_type   = extracted.get("event_type")
        doc.commodity    = extracted.get("commodity")
        doc.response_id  = extracted.get("response_id")
        doc.po_id        = extracted.get("po_id")
        doc.po_number    = extracted.get("po_number")
        doc.agreement_no = extracted.get("agreement_no")
        doc.contact      = extracted.get("contact")
        doc.phone        = extracted.get("phone")
        doc.email        = extracted.get("email")

        items = extracted.get("line_items", [])
        for li_data in items:
            db.add(DocumentLineItem(
                document_id=doc.id,
                item_no     = li_data.get("item_no"),
                description = li_data.get("description"),
                part_number = li_data.get("part_number"),
                quantity    = li_data.get("quantity"),
                unit        = li_data.get("unit"),
                unit_price  = li_data.get("unit_price"),
                total_price = li_data.get("total_price"),
                notes       = li_data.get("notes"),
            ))
        doc.total_line_items = len(items)

    except Exception as e:
        doc.status = "Failed"
        doc.error_message = str(e)

    await db.commit()
    await db.refresh(doc)
    # Reload relationships
    await db.refresh(doc, ["uploader", "line_items"])

    await audit_service.log(
        db, action="document.uploaded",
        user_id=current_user.id, username=current_user.username,
        resource_type="document", resource_id=doc.id,
        details={"filename": file.filename, "status": doc.status},
        ip_address=request.client.host if request.client else None,
    )

    return _doc_to_dict(doc, include_items=True)


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("")
async def list_documents(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_permission(P.FILES_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    q = select(Document)
    if search:
        q = q.where(
            Document.original_filename.ilike(f"%{search}%") |
            Document.rfq_number.ilike(f"%{search}%") |
            Document.account.ilike(f"%{search}%")
        )
    if status:
        q = q.where(Document.status == status)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    q = q.order_by(Document.uploaded_at.desc()).offset((page - 1) * per_page).limit(per_page)
    docs = (await db.execute(q)).scalars().all()

    # Load relationships
    for d in docs:
        await db.refresh(d, ["uploader"])

    return {
        "documents": [_doc_to_dict(d) for d in docs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, -(-total // per_page)),
    }


# ── Detail ────────────────────────────────────────────────────────────────────

@router.get("/{doc_id}")
async def get_document(
    doc_id: int,
    current_user: User = Depends(require_permission(P.FILES_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    doc = (await db.execute(select(Document).where(Document.id == doc_id))).scalars().first()
    if not doc:
        raise HTTPException(404, "Document not found")
    await db.refresh(doc, ["uploader", "line_items"])
    return _doc_to_dict(doc, include_items=True)


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: int,
    request: Request,
    current_user: User = Depends(require_permission(P.FILES_DELETE)),
    db: AsyncSession = Depends(get_db),
):
    doc = (await db.execute(select(Document).where(Document.id == doc_id))).scalars().first()
    if not doc:
        raise HTTPException(404, "Document not found")

    # Remove file from disk
    stored = UPLOAD_DIR / doc.stored_filename
    if stored.exists():
        stored.unlink()

    await db.delete(doc)
    await db.commit()
    await audit_service.log(
        db, action="document.deleted",
        user_id=current_user.id, username=current_user.username,
        resource_type="document", resource_id=doc_id,
        ip_address=request.client.host if request.client else None,
    )
    return {"message": "Document deleted"}


# ── Serve raw file (for in-browser preview) ───────────────────────────────────

MIME_MAP = {
    "pdf":  "application/pdf",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xls":  "application/vnd.ms-excel",
    "csv":  "text/csv",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "doc":  "application/msword",
    "txt":  "text/plain",
}

@router.get("/{doc_id}/file")
async def serve_file(
    doc_id: int,
    current_user: User = Depends(require_permission(P.FILES_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    doc = (await db.execute(select(Document).where(Document.id == doc_id))).scalars().first()
    if not doc:
        raise HTTPException(404, "Document not found")

    file_path = UPLOAD_DIR / doc.stored_filename
    if not file_path.exists():
        raise HTTPException(404, "File not found on disk")

    media_type = MIME_MAP.get(doc.file_type or "", "application/octet-stream")
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=doc.original_filename,
        headers={"Content-Disposition": f'inline; filename="{doc.original_filename}"'},
    )
