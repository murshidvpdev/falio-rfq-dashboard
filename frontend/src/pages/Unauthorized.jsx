import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';

const Unauthorized = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-md"
            >
                <div className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                    <ShieldOff size={36} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-500 mb-8">
                    You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                        <Home size={16} /> Dashboard
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Unauthorized;
