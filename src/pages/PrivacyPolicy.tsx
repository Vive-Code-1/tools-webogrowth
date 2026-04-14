import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => (
  <>
    <SEOHead
      title="Privacy Policy | WeboGrowth Tools"
      description="Read the WeboGrowth Tools privacy policy. Learn how we protect your data. All tools process files locally in your browser — no data is uploaded to our servers."
      keywords="privacy policy, webogrowth privacy, data protection, browser-based tools privacy"
      canonicalPath="/privacy-policy"
    />
    <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 lg:py-20">
      <header className="mb-12">
        <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Legal</span>
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter mb-6">Privacy Policy</h1>
        <p className="text-on-surface-variant">Last updated: April 14, 2026</p>
      </header>

      <div className="prose prose-invert max-w-none space-y-8 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Introduction</h2>
          <p>WeboGrowth Tools ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how our free online tools handle your data when you visit <Link to="/" className="text-primary hover:underline">tools.webogrowth.com</Link>.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Data Processing</h2>
          <p>All our tools process your files and data <strong className="text-foreground">entirely in your browser</strong>. This means:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Your images, code, text, and other files are <strong className="text-foreground">never uploaded</strong> to our servers for processing.</li>
            <li>All compression, conversion, formatting, and generation happens locally on your device.</li>
            <li>We do not store, access, or transmit your files to any third party.</li>
            <li>Once you close the browser tab, all processed data is removed from memory.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Temporary File Storage</h2>
          <p>Some tools may temporarily store processed files to provide download links. These files are:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Stored with a unique identifier and no personal information.</li>
            <li>Automatically deleted after 1 hour.</li>
            <li>Not accessible to any third party.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Cookies & Analytics</h2>
          <p>We may use cookies and analytics tools (such as Google Analytics) to understand how visitors use our site. This data is anonymized and includes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Pages visited and time spent on each page.</li>
            <li>Browser type, device type, and operating system.</li>
            <li>Referring website and geographic region (country-level only).</li>
          </ul>
          <p className="mt-4">We do <strong className="text-foreground">not</strong> use cookies to track individual users or serve targeted advertisements.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Third-Party Services</h2>
          <p>Our website may use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-foreground">Google Fonts</strong> — to load web fonts. Google may collect anonymized usage data.</li>
            <li><strong className="text-foreground">Google Analytics</strong> — for website usage statistics (if enabled).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Children's Privacy</h2>
          <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mt-2">
            <strong className="text-foreground">Email:</strong>{" "}
            <a href="mailto:Support@webogrowth.com" className="text-primary hover:underline">Support@webogrowth.com</a>
          </p>
          <p>
            <strong className="text-foreground">Website:</strong>{" "}
            <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">webogrowth.com</a>
          </p>
        </section>
      </div>
    </div>
  </>
);

export default PrivacyPolicy;
