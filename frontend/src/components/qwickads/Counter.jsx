import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export const Counter = ({ value, suffix = "", duration = 1800 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const format = (n) => n.toLocaleString("en-IN");

  return (
    <span ref={ref} className="tabular-nums">
      {format(display)}
      {suffix}
    </span>
  );
};
