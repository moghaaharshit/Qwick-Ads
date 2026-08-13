import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, RefreshCw } from "lucide-react";
import { IMG } from "../../lib/data";
import { Reveal, Label } from "./Reveal";

export const LiveSimulation = () => {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <section id="simulate" className="relative mx-auto max-w-7xl px-5 py-24 md:px-12 md:py-32" data-testid="simulate-section">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal><Label>Live Campaign Simulation</Label></Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
              See your ad <span className="text-gradient">inside a real cab</span> — instantly.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-base text-slate-400 md:text-lg">
              Upload your creative and watch it appear on the in-cab screen in real time. This is exactly what thousands of passengers will see on every ride.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => inputRef.current?.click()}
                data-testid="sim-upload-btn"
                className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-white"
              >
                <Upload size={18} /> Upload Your Ad
              </button>
              {preview && (
                <button
                  onClick={() => setPreview(null)}
                  data-testid="sim-reset-btn"
                  className="inline-flex items-center gap-2 rounded-full glass px-7 py-4 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <RefreshCw size={16} /> Reset
                </button>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid="sim-file-input" />
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 glow-purple" data-testid="sim-preview">
            <img src={IMG.simBg} alt="Cab interior with mounted screen" className="w-full object-cover" />
            {/* Overlay positioned over the blank headrest screen */}
            <div
              className="absolute overflow-hidden rounded-[6px]"
              style={{ left: "45.5%", top: "29%", width: "22.5%", height: "28%", transform: "perspective(500px) rotateY(-6deg)" }}
            >
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.img
                    key="ad"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={preview}
                    alt="Your advertisement preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-600/40 to-fuchsia-600/30 text-center"
                  >
                    <ImageIcon size={18} className="text-white/80" />
                    <span className="mt-1 px-1 text-[8px] font-semibold uppercase leading-tight tracking-wide text-white/90 md:text-[10px]">
                      Your Ad Here
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 18px rgba(0,0,0,0.6)", background: "linear-gradient(120deg, rgba(255,255,255,0.14), transparent 40%)" }} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
