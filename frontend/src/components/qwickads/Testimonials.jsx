import { Quote, Play } from "lucide-react";
import { TESTIMONIALS } from "../../lib/data";
import { Reveal, Label } from "./Reveal";

const initials = (name) => (name || "").split(" ").map((n) => n[0]).slice(0, 2).join("");

export const Testimonials = ({ items }) => {
  const list = items && items.length ? items : TESTIMONIALS;
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-12 md:py-32" data-testid="testimonials-section">
      <div className="max-w-2xl">
        <Reveal><Label>Testimonials</Label></Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
            Business owners, <span className="text-gradient">on the record.</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        {list.map((t, i) => (
          <Reveal key={t.id || t.name} delay={(i % 2) * 0.1}>
            <figure className="group relative h-full overflow-hidden rounded-3xl glass p-7 transition-colors duration-500 hover:border-violet-500/40 md:p-9">
              <Quote size={40} className="text-violet-500/40" />
              <blockquote className="mt-4 text-lg font-medium leading-relaxed text-slate-100 md:text-xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 font-display text-sm font-black text-white">
                  {initials(t.name)}
                </span>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-slate-400">{t.role} · {t.city}</div>
                </div>
                <span className="ml-auto grid h-10 w-10 place-items-center rounded-full glass text-violet-200 transition-transform duration-500 group-hover:scale-110" aria-label="Play video testimonial">
                  <Play size={14} fill="currentColor" />
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
