import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FileProcessed from './pages/FileProcessed';
import DocumentViewer from './pages/DocumentViewer';
import Unauthorized from './pages/Unauthorized';
import UsersPage from './pages/Admin/UsersPage';
import RolesPage from './pages/Admin/RolesPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected — any authenticated user */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <FileProcessed />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Document viewer — uses /viewer/ prefix to avoid nginx /documents proxy */}
                <Route path="/viewer/:id" element={
                    <ProtectedRoute permission="files.view">
                        <DocumentViewer />
                    </ProtectedRoute>
                } />

                {/* Admin — permission-gated */}
                <Route path="/admin/users" element={
                    <ProtectedRoute permission="users.view">
                        <UsersPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/roles" element={
                    <ProtectedRoute permission="roles.view">
                        <RolesPage />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
