import { STATS } from "../../lib/data";
import { Counter } from "./Counter";
import { Reveal, Label } from "./Reveal";

export const NetworkImpact = ({ stats }) => {
  const list = stats && stats.length ? stats : STATS;
  return (
    <section id="network" className="relative overflow-hidden py-24 md:py-32" data-testid="network-section">
      <div className="spotlight absolute inset-x-0 top-0 h-1/2" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-12">
        <Reveal><Label>Network Impact</Label></Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 max-w-3xl font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
            A city-scale media network, <span className="text-gradient">already in motion.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
          {list.map((s, i) => (
            <Reveal key={s.id || s.label} delay={i * 0.07}>
              <div className="group h-full rounded-3xl glass p-6 transition-colors duration-500 hover:border-violet-500/40 md:p-8">
                <div className="font-display text-3xl font-black text-white md:text-4xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-3 text-sm text-slate-400">{s.label}</div>
                <div className="mt-5 h-px w-full bg-gradient-to-r from-violet-500/60 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
