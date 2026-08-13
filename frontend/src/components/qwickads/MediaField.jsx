import { useRef, useState } from "react";
import { api, fieldCls } from "../../lib/api";
import { saveContent } from "../../lib/firestore";
import { Upload, Link2, Loader2 } from "lucide-react";

/* Handles both uploaded images (via Cloudinary) and pasted URLs / video links. */
export const MediaField = ({ value, onChange }) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBusy(true);
    setError(null);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      
      // Upload to backend (which uploads to Cloudinary)
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Set the Cloudinary URL
      onChange(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Try pasting an image URL instead.");
    } finally {
      setBusy(false);
    }
  };

  const isVideo = /^data:video|\.(mp4|webm|mov)(\?|$)/i.test(value || "");
  const isCloudinary = value?.includes("cloudinary.com") || value?.includes("res.cloudinary.com");
  const showImg = value && !isVideo;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link2 size={15} className="shrink-0 text-slate-500" />
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or upload (e.g., /generated/hero.png)"
          className={fieldCls}
          data-testid="media-url-input"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg glass px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-white/10 disabled:opacity-50"
          data-testid="media-upload-btn"
        >
          {busy ? (
            <><Loader2 size={14} className="animate-spin" /> Uploading...</>
          ) : (
            <><Upload size={14} /> Upload Image</>
          )}
        </button>
        <input ref={ref} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid="media-file-input" />
        {showImg && (
          <img 
            src={value} 
            alt="preview" 
            className="h-11 w-20 rounded-lg border border-white/10 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        {isVideo && <span className="text-xs text-slate-400">Video URL set</span>}
        {isCloudinary && <span className="text-xs text-green-400">✓ Cloudinary</span>}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
