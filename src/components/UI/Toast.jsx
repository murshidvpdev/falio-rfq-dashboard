import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border z-50 ${type === 'success'
                    ? 'bg-white border-green-200 text-green-800'
                    : 'bg-white border-red-200 text-red-800'
                }`}
        >
            <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </div>
            <div>
                <h4 className="font-semibold text-sm">{type === 'success' ? 'Success' : 'Error'}</h4>
                <p className="text-xs opacity-90">{message}</p>
            </div>
            <button onClick={onClose} className="ml-2 hover:bg-slate-100 p-1 rounded-full transition-colors">
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default Toast;
