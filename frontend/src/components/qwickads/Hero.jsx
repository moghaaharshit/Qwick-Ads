import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, MapPin } from "lucide-react";
import { Counter } from "./Counter";

const LINES = ["Your Brand", "Travels With", "Every Passenger"];
const lineVariants = {
  hidden: { y: "110%" },
  show: (i) => ({ y: "0%", transition: { duration: 0.9, delay: 0.5 + i * 0.14, ease: [0.22, 1, 0.36, 1] } }),
};
const FALLBACK = [{ type: "image", media: "/generated/hero.png" }];

export const Hero = ({ onStart, onDemo, slides, stats }) => {
  const list = slides && slides.length ? slides : FALLBACK;
  const pick = (label, dv, ds) => {
    const s = (stats || []).find((x) => x.label === label);
    return s ? { v: s.value, s: s.suffix } : { v: dv, s: ds };
  };
  const chips = [
    { ...pick("Active Screens", 100, "+"), l: "Active Screens" },
    { ...pick("Daily Reach", 25000, "+"), l: "Daily Reach" },
    { ...pick("Monthly Impressions", 7, "M+"), l: "Impressions / mo" },
  ];
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 5500);
    return () => clearInterval(t);
  }, [list.length]);

  const cur = list[idx % list.length];

  return (
    <section ref={ref} id="top" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden" data-testid="hero">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <AnimatePresence>
          <motion.div key={idx} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.3, ease: "easeInOut" }} className="absolute inset-0">
            {cur.type === "video" ? (
              <video src={cur.media} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : (
              <img src={cur.media} alt={cur.title || "QwickAds hero"} className="h-full w-full object-cover" />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-[#080808]/40" />
        <div className="spotlight absolute inset-0" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 md:px-12 md:pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
            <MapPin size={14} className="text-violet-400" /> Digital Ads Inside Moving Cabs
          </span>
        </motion.div>

        <h1 className="mt-6 font-display text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-1">
              <motion.span custom={i} variants={lineVariants} initial="hidden" animate="show" className="block">
                {i === 2 ? <span className="text-gradient">{line}</span> : line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }} className="mt-6 max-w-xl text-base text-slate-300 md:text-lg">
          Reach thousands of commuters daily through smart digital screens installed inside cabs, autos and commercial vehicles across the city.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }} className="mt-9 flex flex-wrap items-center gap-4">
          <button onClick={onStart} data-testid="hero-start-campaign" className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-white">
            Start Campaign <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button onClick={onDemo} data-testid="hero-book-demo" className="inline-flex items-center gap-2 rounded-full glass px-7 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10">
            <Play size={16} className="text-violet-300" /> Book Demo
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {chips.map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl font-extrabold text-white md:text-3xl"><Counter value={s.v} suffix={s.s} /></div>
              <div className="mt-1 text-xs text-slate-400 md:text-sm">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {list.length > 1 && (
        <div className="absolute bottom-8 right-6 z-10 flex gap-2 md:right-12" data-testid="hero-slider-dots">
          {list.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
              data-testid={`hero-slide-dot-${i}`}
              className={`h-2 rounded-full transition-all duration-500 ${i === idx % list.length ? "w-8 bg-violet-400" : "w-2 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent" />
    </section>
  );
};
