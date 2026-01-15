import React from 'react';
import { FileText, ChevronUp, ChevronDown } from 'lucide-react';

const AgreementTable = ({ data }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <FileText className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Agreement Status Summary</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#EEF2FF] text-[#5b6b7c] font-bold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-4 text-center">S.No. <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4">Agreement # <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4 text-center">No. of Items <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4">Validity Start <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4">Validity End <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4">Agreement Total Value <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4 text-right">Estimate Annual Volume <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4 text-right">Released Value <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4 text-center">No. of PO <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4">Delivery Term <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4 text-right">Version <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                            <th className="px-4 py-4 text-center">Status <div className="inline-block align-middle"><ChevronUp size={10} /><ChevronDown size={10} /></div></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, index) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-4 text-center text-slate-500">{index + 1}</td>
                                <td className="px-4 py-4 font-medium text-slate-700">{row.agreementNo}</td>
                                <td className="px-4 py-4 text-center text-slate-700">{row.noOfItems}</td>
                                <td className="px-4 py-4 text-slate-500">{row.validityStart}</td>
                                <td className="px-4 py-4 text-slate-500">{row.validityEnd}</td>
                                <td className="px-4 py-4 text-slate-700">{row.totalValue}</td>
                                <td className="px-4 py-4 text-right text-slate-700 font-medium">{row.estVolume}</td>
                                <td className="px-4 py-4 text-right text-slate-700 font-medium">{row.releasedValue}</td>
                                <td className="px-4 py-4 text-center text-slate-700">{row.noOfPO}</td>
                                <td className="px-4 py-4 text-slate-500">{row.term}</td>
                                <td className="px-4 py-4 text-right text-slate-700">{row.version}</td>
                                <td className="px-4 py-4 text-center">
                                    {row.status && (
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                            {row.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                {/* Pagination mocked */}
                <div className="flex gap-1">
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-slate-400">«</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-indigo-50 text-indigo-600 font-bold">1</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-slate-600">2</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-slate-600">3</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-slate-600">4</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-slate-400">»</button>
                </div>
            </div>
        </div>
    );
};

export default AgreementTable;
