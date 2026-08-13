import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { WHY } from "../../lib/data";
import { Reveal, Label } from "./Reveal";

const TiltCard = ({ item, index }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 18 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <Reveal delay={(index % 3) * 0.08}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        className="group relative h-full overflow-hidden rounded-3xl glass p-8 transition-colors duration-500 hover:border-violet-500/40"
        data-testid={`why-card-${index}`}
      >
        <div className="font-display text-sm font-black text-violet-400">0{index + 1}</div>
        <h3 className="mt-4 font-display text-xl font-bold text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-violet-600/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>
    </Reveal>
  );
};

export const WhyQwickAds = () => (
  <section id="why" className="relative mx-auto max-w-7xl px-5 py-24 md:px-12 md:py-32" data-testid="why-section">
    <div className="max-w-2xl">
      <Reveal><Label>Why QwickAds</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
          The smartest media buy <span className="text-gradient">in the city.</span>
        </h2>
      </Reveal>
    </div>

    <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {WHY.map((item, i) => (
        <TiltCard key={item.title} item={item} index={i} />
      ))}
    </div>
  </section>
);
