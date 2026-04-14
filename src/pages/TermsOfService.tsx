import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";

const TermsOfService = () => (
  <>
    <SEOHead
      title="Terms of Service | WeboGrowth Tools"
      description="Read the WeboGrowth Tools terms of service. Understand the terms and conditions for using our free online developer and designer tools."
      keywords="terms of service, webogrowth terms, terms and conditions, free tools terms"
      canonicalPath="/terms-of-service"
    />
    <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 lg:py-20">
      <header className="mb-12">
        <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Legal</span>
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter mb-6">Terms of Service</h1>
        <p className="text-on-surface-variant">Last updated: April 14, 2026</p>
      </header>

      <div className="prose prose-invert max-w-none space-y-8 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Acceptance of Terms</h2>
          <p>By accessing and using WeboGrowth Tools at <Link to="/" className="text-primary hover:underline">tools.webogrowth.com</Link>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Description of Service</h2>
          <p>WeboGrowth Tools provides free, browser-based online tools for developers and designers, including but not limited to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Image compression, conversion, and resizing</li>
            <li>Code formatting and minification (JSON, CSS, HTML)</li>
            <li>SEO tools (meta tag generation, robots.txt, OG preview)</li>
            <li>Design tools (color palette, gradient generator, QR codes)</li>
            <li>Text utilities (Lorem Ipsum, Base64 encoding)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Use of Service</h2>
          <p>You agree to use WeboGrowth Tools only for lawful purposes. You may not:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Use the service to process illegal or harmful content.</li>
            <li>Attempt to reverse-engineer, decompile, or disassemble any part of the service.</li>
            <li>Use automated scripts or bots to access the service excessively.</li>
            <li>Interfere with or disrupt the service or its infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Intellectual Property</h2>
          <p>The WeboGrowth Tools website, its design, code, and content are the intellectual property of <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WeboGrowth</a>. You may not copy, modify, or distribute any part of this website without prior written consent.</p>
          <p className="mt-4">Files you process using our tools remain your property. We do not claim any ownership over your uploaded or processed files.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Disclaimer of Warranties</h2>
          <p>WeboGrowth Tools is provided "as is" and "as available" without any warranties of any kind. We do not guarantee that:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>The service will be uninterrupted or error-free.</li>
            <li>The results of any tool will be accurate or reliable.</li>
            <li>Any defects will be corrected.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Limitation of Liability</h2>
          <p>In no event shall WeboGrowth be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of WeboGrowth Tools. Our total liability shall not exceed $0 as this is a free service.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Changes to Terms</h2>
          <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold text-foreground mb-4">Contact</h2>
          <p>For questions about these Terms of Service, contact us at:</p>
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

export default TermsOfService;
