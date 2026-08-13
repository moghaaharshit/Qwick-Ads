import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, X } from "lucide-react";
import { IMG } from "../../lib/data";
import { api } from "../../lib/api";
import { Reveal, Label } from "./Reveal";

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&\s?]+)/);
  return match ? match[1] : null;
}

export const VideoSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);
  const [videoUrl, setVideoUrl] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    api.get("/settings/live-video")
      .then((r) => { if (r.data.value) setVideoUrl(r.data.value); })
      .catch(() => {});
  }, []);

  const videoId = extractYouTubeId(videoUrl);

  return (
    <section ref={ref} className="relative mx-auto max-w-7xl px-5 md:px-12" data-testid="video-section">
      <Reveal className="mb-8">
        <Label>The Film</Label>
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
          A night in the life of <span className="text-gradient">your campaign.</span>
        </h2>
      </Reveal>

      <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/10">
        {playing && videoId ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="Live Campaign Video"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setPlaying(false)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
              aria-label="Close video"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <motion.img style={{ y }} src={IMG.video} alt="Aerial cinematic Mumbai night traffic" className="absolute inset-0 h-[120%] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => videoId && setPlaying(true)}
                data-testid="video-play-btn"
                aria-label="Play cinematic reel"
                className={`grid h-20 w-20 place-items-center rounded-full glass-strong glow-purple md:h-24 md:w-24 ${!videoId ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
              >
                <span className="absolute h-full w-full animate-ping rounded-full bg-violet-500/20" />
                <Play size={30} className="translate-x-0.5 text-white" fill="white" />
              </motion.button>
              <p className="mt-6 font-display text-sm uppercase tracking-[0.3em] text-slate-300">
                {videoId ? "Watch The Reel" : "No video configured"}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
