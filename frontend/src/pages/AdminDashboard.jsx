import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogOut, Plus, Save, Trash2, Loader2, Eye, Film } from "lucide-react";
import { api, fieldCls } from "../lib/api";
import { fetchContent, saveContent, deleteContent } from "../lib/firestore";
import { useAuth } from "../context/AuthContext";
import { MediaField } from "../components/qwickads/MediaField";

const SCHEMAS = {
  "hero-slides": {
    label: "Hero Slider",
    fields: [
      { k: "type", type: "select", opts: ["image", "video"] },
      { k: "media", type: "media", label: "Media (image or mp4 URL)" },
      { k: "title", type: "text" },
      { k: "caption", type: "text" },
      { k: "order", type: "number" },
    ],
    blank: { type: "image", media: "", title: "", caption: "", order: 0 },
    title: (i) => i.title || "Untitled slide",
  },
  showcase: {
    label: "Showcase",
    fields: [
      { k: "image", type: "media" },
      { k: "tag", type: "text" },
      { k: "title", type: "text" },
      { k: "order", type: "number" },
    ],
    blank: { image: "", tag: "", title: "", order: 0 },
    title: (i) => i.title || i.tag || "Showcase item",
  },
  testimonials: {
    label: "Testimonials",
    fields: [
      { k: "name", type: "text" },
      { k: "role", type: "text" },
      { k: "city", type: "text" },
      { k: "quote", type: "textarea" },
      { k: "order", type: "number" },
    ],
    blank: { name: "", role: "", city: "", quote: "", order: 0 },
    title: (i) => i.name || "New testimonial",
  },
  stats: {
    label: "Stats",
    fields: [
      { k: "value", type: "number" },
      { k: "suffix", type: "text" },
      { k: "label", type: "text" },
      { k: "order", type: "number" },
    ],
    blank: { value: 0, suffix: "", label: "", order: 0 },
    title: (i) => i.label || "New stat",
  },
};

const TABS = [...Object.keys(SCHEMAS), "live-video", "control-panel"];

function ControlPanel() {
  return (
    <div className="fixed inset-0 z-50 bg-[#080808]">
      <iframe
        src="https://cabadsrun.netlify.app/"
        title="Control Panel"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function LiveVideoPanel() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings/live-video")
      .then((r) => setUrl(r.data.value || ""))
      .catch(() => {}) 
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings/live-video", { value: url });
      toast.success("Video link saved!");
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const extractId = (link) => {
    if (!link) return null;
    const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&\s?]+)/);
    return match ? match[1] : null;
  };

  const videoId = extractId(url);

  return (
    <div className="rounded-2xl glass p-6" data-testid="admin-live-video">
      <h2 className="mb-2 font-display text-xl font-bold">Live Campaign Video</h2>
      <p className="mb-5 text-sm text-slate-400">
        Paste a YouTube video link below. It will appear in the "Live Campaign Simulation" section on the website.
      </p>
      <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-400">YouTube Video URL</label>
      <input
        className={fieldCls}
        type="text"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        data-testid="admin-video-url"
      />
      <button
        onClick={save}
        disabled={saving}
        className="btn-primary mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
        data-testid="admin-save-video"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Video Link
      </button>

      {videoId && (
        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Preview</p>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Live Campaign Video"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ kind, item, onSaved, onDeleted }) {
  const schema = SCHEMAS[kind];
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await saveContent(kind, form);
      onSaved(form);
      toast.success("Saved");
    } catch (e) {
      toast.error("Save failed");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    setDel(true);
    try {
      await deleteContent(kind, item.id);
      onDeleted(item.id);
      toast.success("Deleted");
    } catch (e) { toast.error("Delete failed"); setDel(false); }
  };

  return (
    <div className="rounded-2xl glass p-5" data-testid={`admin-item-${kind}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {schema.fields.map((f) => (
          <div key={f.k} className={f.type === "textarea" || f.type === "media" ? "md:col-span-2" : ""}>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-400">{f.label || f.k}</label>
            {f.type === "media" ? (
              <MediaField value={form[f.k]} onChange={(v) => set(f.k, v)} />
            ) : f.type === "textarea" ? (
              <textarea className={`${fieldCls} h-24 resize-none py-3`} value={form[f.k] || ""} onChange={(e) => set(f.k, e.target.value)} />
            ) : f.type === "select" ? (
              <select className={fieldCls} value={form[f.k]} onChange={(e) => set(f.k, e.target.value)}>
                {f.opts.map((o) => <option key={o} value={o} className="bg-[#12121a]">{o}</option>)}
              </select>
            ) : (
              <input
                className={fieldCls}
                type={f.type === "number" ? "number" : "text"}
                value={form[f.k] ?? ""}
                onChange={(e) => set(f.k, f.type === "number" ? Number(e.target.value) : e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" data-testid="admin-save-item">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
        </button>
        <button onClick={remove} disabled={del} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20" data-testid="admin-delete-item">
          {del ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("hero-slides");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (kind) => {
    setLoading(true);
    try {
      const data = await fetchContent(kind);
      setItems(data);
    } catch (e) { toast.error("Failed to load content"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const addNew = async () => {
    try {
      const blank = { ...SCHEMAS[tab].blank, order: items.length };
      const id = `new_${Date.now()}`;
      const newItem = { ...blank, id };
      await saveContent(tab, newItem);
      setItems((prev) => [...prev, newItem]);
      toast.success("New item added — edit and save");
    } catch (e) { toast.error("Could not add item"); }
  };

  const doLogout = () => { logout(); nav("/admin/login"); };

  return (
    <div className="grain min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080808]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-display text-sm font-black">Q</span>
            <div>
              <div className="font-display text-base font-extrabold">QwickAds Admin</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10" data-testid="admin-view-site"><Eye size={15} /> View Site</a>
            <button onClick={doLogout} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm hover:bg-white/10" data-testid="admin-logout"><LogOut size={15} /> Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`admin-tab-${t}`}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${tab === t ? "btn-primary text-white" : "glass text-slate-300 hover:bg-white/10"}`}
            >
              {t === "live-video" ? "Live Video" : t === "control-panel" ? "Control Panel" : SCHEMAS[t].label}
            </button>
          ))}
        </div>

        {tab === "control-panel" ? (
          <ControlPanel />
        ) : tab === "live-video" ? (
          <LiveVideoPanel />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="font-display text-2xl font-black">{SCHEMAS[tab].label}</h1>
              <button onClick={addNew} className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" data-testid="admin-add-new">
                <Plus size={16} /> Add New
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-20 text-slate-400"><Loader2 className="animate-spin" size={18} /> Loading…</div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl glass p-10 text-center text-slate-400">No items yet. Click "Add New".</div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-4">
                {items.map((it) => (
                  <ItemCard
                    key={it.id}
                    kind={tab}
                    item={it}
                    onSaved={(d) => setItems((prev) => prev.map((p) => (p.id === d.id ? d : p)))}
                    onDeleted={(id) => setItems((prev) => prev.filter((p) => p.id !== id))}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
