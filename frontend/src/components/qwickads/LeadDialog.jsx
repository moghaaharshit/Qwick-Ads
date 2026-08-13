import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqerrjba";

const BUDGETS = ["Under ₹25,000", "₹25,000 – ₹1,00,000", "₹1,00,000 – ₹5,00,000", "₹5,00,000+"];

const field = "h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

export const LeadDialog = ({ open, onOpenChange, title = "Start Your Campaign" }) => {
  const [form, setForm] = useState({ name: "", mobile: "", company: "", city: "", budget: "", requirement: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      toast.error("Please enter your name and mobile number.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, formType: title };
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Formspree error");
      setDone(true);
      toast.success("Request received! Our team will reach out shortly.");
      setTimeout(() => {
        onOpenChange(false);
        setDone(false);
        setForm({ name: "", mobile: "", company: "", city: "", budget: "", requirement: "" });
      }, 1800);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-[#0c0c0f] text-white" data-testid="lead-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-black">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tell us a little about your brand. We&apos;ll put together a plan for you.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle2 size={56} className="text-violet-400" />
            <p className="font-display text-xl font-bold">You&apos;re on the move!</p>
            <p className="text-sm text-slate-400">Our team will contact you within 24 hours.</p>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="lead-form">
            <input className={field} placeholder="Full Name*" value={form.name} onChange={set("name")} data-testid="lead-name" />
            <input className={field} placeholder="Mobile Number*" value={form.mobile} onChange={set("mobile")} data-testid="lead-mobile" />
            <input className={field} placeholder="Company" value={form.company} onChange={set("company")} data-testid="lead-company" />
            <input className={field} placeholder="City" value={form.city} onChange={set("city")} data-testid="lead-city" />
            <div className="sm:col-span-2">
              <Select value={form.budget} onValueChange={(v) => setForm((f) => ({ ...f, budget: v }))}>
                <SelectTrigger className={field} data-testid="lead-budget">
                  <SelectValue placeholder="Monthly Budget" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#12121a] text-white">
                  {BUDGETS.map((b) => (
                    <SelectItem key={b} value={b} className="focus:bg-violet-600/30">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <textarea
              className={`${field} h-24 resize-none py-3 sm:col-span-2`}
              placeholder="Campaign requirement — what are you promoting?"
              value={form.requirement}
              onChange={set("requirement")}
              data-testid="lead-requirement"
            />
            <button type="submit" disabled={loading} className="btn-primary sm:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-70" data-testid="lead-submit">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
              {loading ? "Sending..." : "Submit Request"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
