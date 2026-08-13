import Marquee from "react-fast-marquee";

const ITEMS = [
  "Your Brand On The Move",
  "7M+ Monthly Impressions",
  "100+ Active Screens",
  "95% Ad Completion",
  "Hyper-Local Targeting",
  "Inside Cabs • Autos • Cabs",
];

export const EditorialMarquee = () => (
  <div className="border-y border-white/10 bg-[#0a0a0c] py-6" data-testid="marquee">
    <Marquee speed={40} gradient gradientColor="#0a0a0c" gradientWidth={120}>
      {ITEMS.concat(ITEMS).map((t, i) => (
        <span key={i} className="mx-8 inline-flex items-center gap-8 font-display text-xl font-bold uppercase tracking-tight text-slate-500 md:text-3xl">
          {t}
          <span className="text-violet-500">✦</span>
        </span>
      ))}
    </Marquee>
  </div>
);
