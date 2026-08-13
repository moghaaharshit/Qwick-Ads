import { motion } from "framer-motion";
import { Building2, UtensilsCrossed, HeartPulse, GraduationCap, Home, ShoppingBag, Scissors, Dumbbell, Plane } from "lucide-react";
import { INDUSTRIES } from "../../lib/data";
import { Reveal, Label } from "./Reveal";

const ICONS = [Building2, UtensilsCrossed, HeartPulse, GraduationCap, Home, ShoppingBag, Scissors, Dumbbell, Plane];

export const Industries = () => (
  <section id="industries" className="relative mx-auto max-w-7xl px-5 py-24 md:px-12 md:py-32" data-testid="industries-section">
    <div className="max-w-2xl">
      <Reveal><Label>Industries Served</Label></Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
          Built for brands that <span className="text-gradient">want to be seen.</span>
        </h2>
      </Reveal>
    </div>

    <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-3">
      {INDUSTRIES.map((name, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <Reveal key={name} delay={(i % 3) * 0.06}>
            <motion.div
              whileHover={{ y: -5 }}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl glass p-5 transition-colors duration-500 hover:border-violet-500/40 md:p-6"
              data-testid={`industry-${i}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 text-violet-200 transition-transform duration-500 group-hover:scale-110">
                <Icon size={22} strokeWidth={1.5} />
              </span>
              <span className="font-display text-sm font-bold text-white md:text-base">{name}</span>
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          </Reveal>
        );
      })}
    </div>
  </section>
);
