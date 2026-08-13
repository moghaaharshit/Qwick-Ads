import { motion } from "framer-motion";
import { SHOWCASE } from "../../lib/data";
import { Reveal, Label } from "./Reveal";

export const ScreenShowcase = ({ items }) => {
  const list = items && items.length ? items : SHOWCASE;
  return (
    <section id="showcase" className="relative mx-auto max-w-7xl px-5 py-24 md:px-12 md:py-32" data-testid="showcase-section">
      <div className="max-w-2xl">
        <Reveal><Label>The Screen Experience</Label></Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
            Real screens. Real cabs. <span className="text-gradient">Real attention.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-base text-slate-400 md:text-lg">
            Not mockups — a hyper-real look at the passenger&apos;s view. A bright digital screen behind every headrest, playing your ad on loop through the entire ride.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-12 gap-5 md:gap-6">
        {list.map((item, i) => (
          <Reveal
            key={item.id || item.key || i}
            delay={i * 0.08}
            className={i % 4 === 0 ? "col-span-12 md:col-span-8" : i % 4 === 1 ? "col-span-12 md:col-span-4" : "col-span-12 sm:col-span-6 md:col-span-4"}
          >
            <motion.figure whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="group relative h-full min-h-[240px] overflow-hidden rounded-3xl border border-white/10 md:min-h-[300px]">
              <img src={item.image || item.img} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <span className="rounded-full glass px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet-200">{item.tag}</span>
                <p className="mt-3 font-display text-lg font-bold text-white md:text-xl">{item.title}</p>
              </figcaption>
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: "inset 0 0 60px rgba(139,92,246,0.35)" }} />
            </motion.figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
