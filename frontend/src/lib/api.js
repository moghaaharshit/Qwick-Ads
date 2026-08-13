import axios from "axios";

// Inline API URL - works on both local and Vercel
// On Vercel, /api routes are proxied to the backend
const API = "/api";

export const api = axios.create({ baseURL: API });

export const getToken = () => localStorage.getItem("qa_token");
export const setToken = (t) => localStorage.setItem("qa_token", t);
export const clearToken = () => localStorage.removeItem("qa_token");

api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// If a stored token is rejected on any protected call, clear it so the user
// is never left in a stuck "logged-in but unauthorized" state.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.includes("/auth/login")) {
      clearToken();
    }
    return Promise.reject(err);
  }
);

export const fieldCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
