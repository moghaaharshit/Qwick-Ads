import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fieldCls } from "../lib/api";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) nav("/admin", { replace: true });
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back, Admin.");
      nav("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-[#080808] px-5">
      <div className="spotlight absolute inset-x-0 top-0 h-1/2" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl glass-strong p-8 md:p-10"
        data-testid="admin-login-card"
      >
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-display text-base font-black text-white">Q</span>
          <div>
            <div className="font-display text-lg font-extrabold">Qwick<span className="text-violet-400">Ads</span></div>
            <div className="text-xs text-slate-400">Content Admin</div>
          </div>
        </div>

        <h1 className="font-display text-2xl font-black">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Manage slides, showcase, testimonials & stats.</p>

        <form onSubmit={submit} className="mt-7 space-y-3" data-testid="admin-login-form">
          <input className={fieldCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email" />
          <input className={fieldCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-password" />
          <button type="submit" disabled={loading} className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-70" data-testid="admin-login-submit">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
            {loading ? "Signing in..." : "Enter Dashboard"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
