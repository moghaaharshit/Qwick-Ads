import { motion } from "framer-motion";
import { ArrowRight, Play, MessageCircle } from "lucide-react";
import { IMG, NAV } from "../../lib/data";
import { Reveal } from "./Reveal";

const WHATSAPP = "https://wa.me/917400449431?text=Hi%20QwickAds%2C%20I%27d%20like%20to%20advertise%20on%20your%20cab%20screens.";

export const Footer = ({ onStart, onDemo }) => (
  <footer className="relative overflow-hidden" data-testid="footer">
    <div className="absolute inset-0">
      <img src={IMG.hero} alt="" className="h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#080808]/85 to-[#080808]" />
    </div>

    <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-12 md:py-36">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          Ready To Put Your Brand <span className="text-gradient">On The Move?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-slate-300 md:text-lg">
          Join the growing network of businesses reaching thousands of commuters every day — inside the cabs they ride.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button onClick={onStart} data-testid="footer-start" className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-white">
            Start Advertising <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button onClick={onDemo} data-testid="footer-demo" className="inline-flex items-center gap-2 rounded-full glass px-7 py-4 text-sm font-semibold text-white hover:bg-white/10">
            <Play size={16} className="text-violet-300" /> Schedule A Demo
          </button>
          <motion.a
            whileHover={{ scale: 1.03 }}
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-whatsapp"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-7 py-4 text-sm font-semibold text-emerald-300 transition-colors duration-300 hover:bg-emerald-500/20"
          >
            <MessageCircle size={16} /> WhatsApp Us
          </motion.a>
        </div>
      </Reveal>

      <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-display text-sm font-black text-white">Q</span>
          <span className="font-display text-lg font-extrabold">Qwick<span className="text-violet-400">Ads</span></span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-slate-400 transition-colors hover:text-white">{n.label}</a>
          ))}
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} QwickAds. Your brand, on the move.</p>
      </div>
    </div>
  </footer>
);
