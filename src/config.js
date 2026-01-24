const backend = import.meta.env.VITE_API_BASE_URL || "";
export const BACKEND_ORIGIN = backend ? backend.replace(/\/$/, "") : "";
export const API_BASE_URL = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : "/api";
