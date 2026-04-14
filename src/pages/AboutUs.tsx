import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";

const services = [
  { icon: "language", title: "Web Development", desc: "Custom websites and web applications built with modern technologies for optimal performance and user experience." },
  { icon: "query_stats", title: "SEO Services", desc: "Data-driven search engine optimization strategies to boost your rankings and drive organic traffic." },
  { icon: "brush", title: "Graphic Design", desc: "Creative visual design for branding, marketing materials, social media, and digital assets." },
  { icon: "share", title: "Social Media Marketing", desc: "Strategic social media management and advertising campaigns to grow your brand presence." },
  { icon: "design_services", title: "UI/UX Design", desc: "User-centered interface design that delivers intuitive, engaging digital experiences." },
  { icon: "cloud", title: "SaaS Development", desc: "Scalable software-as-a-service solutions built from concept to launch and beyond." },
];

const AboutUs = () => (
  <>
    <SEOHead
      title="About Us - WeboGrowth Digital Agency | WeboGrowth Tools"
      description="WeboGrowth is a full-service digital agency specializing in web development, SEO, graphic design, social media marketing, and SaaS development. Based in Bogura, Bangladesh."
      keywords="webogrowth, digital agency, web development company, seo agency, graphic design, bangladesh"
      canonicalPath="/about-us"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "WeboGrowth",
        url: "https://webogrowth.com",
        logo: "https://tools.webogrowth.com/logo.png",
        description: "Full-service digital agency specializing in web development, SEO, graphic design, and SaaS development.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Uposhohor Rd No 1, Apt 423",
          addressLocality: "Bogura",
          addressCountry: "BD",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+880-1791208768",
          email: "Support@webogrowth.com",
          contactType: "customer service",
        },
      }}
    />
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
      <header className="mb-16">
        <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">About Us</span>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
          We Are <span className="text-primary">WeboGrowth</span>
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg leading-relaxed">
          WeboGrowth is a full-service digital agency helping businesses grow through innovative technology solutions. From web development to SEO, we provide end-to-end digital services that drive results.
        </p>
      </header>

      {/* Mission */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-headline font-bold mb-6">Our Mission</h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              At WeboGrowth, we believe that every business deserves access to high-quality digital tools and services. That's why we created WeboGrowth Tools — a collection of 17+ free online tools for developers, designers, and marketers.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Our tools are designed to be fast, private, and accessible. Everything processes in your browser — no uploads, no data collection, no hidden costs.
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-8 md:p-12">
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "17+", label: "Free Tools" },
                { value: "100%", label: "Browser-Based" },
                { value: "0", label: "Data Collected" },
                { value: "24/7", label: "Available" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-headline font-black text-primary">{stat.value}</div>
                  <div className="text-sm text-on-surface-variant mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mb-20">
        <h2 className="text-3xl font-headline font-bold mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.title} className="bg-surface-container rounded-xl p-8 hover:bg-surface-container-highest transition-colors">
              <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-lg mb-4">
                <span className="material-symbols-outlined text-secondary">{service.icon}</span>
              </div>
              <h3 className="text-xl font-headline font-bold mb-2">{service.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Office Info */}
      <section className="mb-20">
        <h2 className="text-3xl font-headline font-bold mb-8">Our Office</h2>
        <div className="bg-surface-container rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="material-symbols-outlined text-primary text-3xl mb-3 block">location_on</span>
              <h3 className="font-headline font-bold mb-2">Head Office</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Uposhohor Rd No 1, Apt 423<br />Bogura, Bangladesh</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-primary text-3xl mb-3 block">phone</span>
              <h3 className="font-headline font-bold mb-2">Phone</h3>
              <p className="text-on-surface-variant text-sm">
                <a href="tel:+8801791208768" className="hover:text-primary transition-colors">+880 1791208768</a>
              </p>
            </div>
            <div>
              <span className="material-symbols-outlined text-primary text-3xl mb-3 block">mail</span>
              <h3 className="font-headline font-bold mb-2">Email</h3>
              <p className="text-on-surface-variant text-sm">
                <a href="mailto:Support@webogrowth.com" className="hover:text-primary transition-colors">Support@webogrowth.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-surface-container rounded-xl p-12">
        <h2 className="text-3xl font-headline font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">Try our free online tools or contact us for custom digital solutions for your business.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all">
            Explore Tools
          </Link>
          <Link to="/contact-us" className="bg-surface-container-highest text-foreground px-8 py-3 rounded-lg font-bold hover:bg-surface-container-low transition-all">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  </>
);

export default AboutUs;
