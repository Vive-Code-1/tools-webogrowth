import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContactUs = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // Read admin-configured recipient email
      let toEmail = "rafikuzzaman10@gmail.com";
      try {
        const saved = localStorage.getItem("wg_admin_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.siteEmail) toEmail = parsed.siteEmail;
        }
      } catch {}

      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: { name: name.trim(), email: email.trim(), service: form.service, message: message.trim(), toEmail },
      });

      if (error) throw error;

      toast({ title: "Message sent successfully!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", service: "", message: "" });
    } catch {
      toast({
        title: "Could not send message automatically",
        description: "Please email us directly at Support@webogrowth.com",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Us - Get in Touch | WeboGrowth Tools"
        description="Contact WeboGrowth for web development, SEO, graphic design, and digital marketing services. Reach us at Support@webogrowth.com or call +880 1791208768."
        keywords="contact webogrowth, web development contact, seo services contact, digital agency bangladesh"
        canonicalPath="/contact-us"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact WeboGrowth",
          url: "https://tools.webogrowth.com/contact-us",
          mainEntity: {
            "@type": "Organization",
            name: "WeboGrowth",
            telephone: "+880-1791208768",
            email: "Support@webogrowth.com",
            address: { "@type": "PostalAddress", streetAddress: "Uposhohor Rd No 1, Apt 423", addressLocality: "Bogura", addressCountry: "BD" },
          },
        }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <AnimatedSection>
          <header className="mb-12">
            <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Contact</span>
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
              Have a project in mind or need help with our tools? We'd love to hear from you.
            </p>
          </header>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <AnimatedSection delay={0.1}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Service Interested In</label>
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Select a service</option>
                  <option value="Web Development">Web Development</option>
                  <option value="SEO Services">SEO Services</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Social Media Marketing">Social Media Marketing</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="SaaS Development">SaaS Development</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Message *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} rows={5} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Tell us about your project or question..." />
              </div>
              <motion.button
                type="submit"
                disabled={sending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all w-full md:w-auto disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">{sending ? "hourglass_empty" : "send"}</span>
                  {sending ? "Sending..." : "Send Message"}
                </span>
              </motion.button>
            </form>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              {[
                { icon: "location_on", title: "Head Office", lines: ["Uposhohor Rd No 1, Apt 423", "Bogura, Bangladesh"] },
                { icon: "phone", title: "Phone", lines: ["+880 1791208768"], href: "tel:+8801791208768" },
                { icon: "mail", title: "Email", lines: ["Support@webogrowth.com"], href: "mailto:Support@webogrowth.com" },
                { icon: "chat", title: "WhatsApp", lines: ["Chat with us on WhatsApp"], href: "https://wa.me/8801791208768" },
              ].map((item) => (
                <motion.div key={item.title} whileHover={{ scale: 1.02 }} className="bg-surface-container rounded-xl p-6 flex gap-4 items-start">
                  <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-lg flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold mb-1">{item.title}</h3>
                    {item.lines.map((line) =>
                      item.href ? (
                        <a key={line} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block text-on-surface-variant text-sm hover:text-primary transition-colors">{line}</a>
                      ) : (
                        <p key={line} className="text-on-surface-variant text-sm">{line}</p>
                      )
                    )}
                  </div>
                </motion.div>
              ))}
              <motion.div whileHover={{ scale: 1.02 }} className="bg-surface-container rounded-xl p-6">
                <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                  <img src="/wg-icon.png" alt="WeboGrowth" className="w-14 h-14 rounded-lg object-contain flex-shrink-0" />
                  <div>
                    <h3 className="font-headline font-bold mb-1">Visit Our Website</h3>
                    <span className="text-primary hover:underline font-bold">webogrowth.com</span>
                  </div>
                </a>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
