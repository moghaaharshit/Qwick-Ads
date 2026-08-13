import { motion } from "framer-motion";
import { STEPS } from "../../lib/data";
import { Reveal, Label } from "./Reveal";

export const HowItWorks = () => (
  <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-12 md:py-32" data-testid="how-section">
    <div className="max-w-2xl">
      <Reveal><Label>How It Works</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
          Live in four <span className="text-gradient">simple moves.</span>
        </h2>
      </Reveal>
    </div>

    <div className="relative mt-16">
      <div className="absolute left-0 right-0 top-8 hidden h-px md:block">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          style={{ transformOrigin: "left" }}
          className="h-full w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-transparent"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <div className="relative">
              <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl glass-strong font-display text-xl font-black text-violet-300 glow-purple">
                {s.n}
              </div>
              <h3 className="font-display text-lg font-bold text-white md:text-xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
