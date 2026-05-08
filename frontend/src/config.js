// In Docker (nginx proxy): set VITE_API_BASE_URL="" in .env → relative paths → nginx forwards
// In local dev: set VITE_API_BASE_URL=http://localhost:8000 in frontend/.env.local

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const getWsUrl = (path) => {
    const base = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8000';
    if (base) return `${base}${path}`;
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${window.location.host}${path}`;
};
