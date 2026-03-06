import { useState } from "react";
import { ArrowLeft, MessageCircle, Mail, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  { q: "How do I update my menu?", a: "Go to the Menu tab and tap the + icon to add items, or tap any item to edit." },
  { q: "When do I get paid?", a: "Payouts are processed weekly on Fridays to your registered bank account." },
  { q: "How do I change my store hours?", a: "Go to Profile → Operating Hours to set your daily schedule." },
  { q: "What if a rider doesn't pick up?", a: "You can reassign the order to another rider from the order detail screen." },
];

const ISSUE_TYPES = ["Order Issue", "Payment Problem", "Menu Issue", "Account Issue", "Other"];

const HelpSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!issueType || !description) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setShowReport(false);
    setIssueType("");
    setDescription("");
    toast({ title: "Report submitted", description: "We'll get back to you shortly." });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Help & Support</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* FAQs */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">FAQs</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl bg-card shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground text-left">{faq.q}</span>
                  <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Us</h2>
          <div className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm active:bg-muted">
              <MessageCircle size={18} className="text-primary" />
              <span className="text-sm font-medium text-foreground">WhatsApp Support</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm active:bg-muted">
              <Mail size={18} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Email Support</span>
            </button>
          </div>
        </div>

        {/* Report */}
        <div>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowReport(!showReport)}>
            Report a Problem
          </Button>
          {showReport && (
            <div className="mt-4 space-y-4 rounded-xl bg-card p-4 shadow-sm animate-fade-in-up">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Issue Type</label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your issue..." />
              </div>
              <Button className="w-full rounded-xl" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
