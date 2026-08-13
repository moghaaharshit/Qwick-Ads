import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 28, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

export const Label = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.25em] font-semibold text-violet-300/80 ${className}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_2px_rgba(139,92,246,0.8)]" />
    {children}
  </span>
);
