import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV } from "../../lib/data";

export const Navbar = ({ onCta }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        data-testid="navbar"
        className={`fixed left-1/2 top-4 z-50 w-[94%] max-w-6xl -translate-x-1/2 rounded-full px-5 py-3 transition-[background,box-shadow] duration-500 md:top-6 md:px-8 md:py-4 ${
          scrolled ? "glass-strong glow-purple" : "glass"
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="#top" data-testid="logo" className="flex items-center gap-2">
            <img src="/logo.png" alt="QwickAds Logo" className="h-12 w-12 rounded-xl object-contain" style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.7)) drop-shadow(0 0 20px rgba(255,255,255,0.3))" }} />
            <span className="font-display text-lg font-extrabold tracking-tight">
              Qwick<span className="text-violet-400">Ads</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm text-slate-300 transition-colors duration-300 hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCta}
              data-testid="nav-cta"
              className="btn-primary hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white md:inline-flex"
            >
              Start Campaign <ArrowUpRight size={16} />
            </button>
            <button
              aria-label="Toggle menu"
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full glass md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-1/2 top-20 z-40 w-[94%] -translate-x-1/2 rounded-3xl glass-strong p-6 md:hidden"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col gap-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="text-lg text-slate-200"
                >
                  {n.label}
                </a>
              ))}
              <button
                onClick={() => { setOpen(false); onCta(); }}
                className="btn-primary mt-2 rounded-full px-5 py-3 font-semibold text-white"
              >
                Start Campaign
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
