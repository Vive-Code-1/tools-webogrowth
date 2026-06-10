import { Link } from "react-router-dom";
import { getTool } from "@/lib/seo";

interface ToolSeoSectionProps {
  path: string;
}

const ToolSeoSection = ({ path }: ToolSeoSectionProps) => {
  const tool = getTool(path);
  if (!tool || (!tool.faqs.length && !tool.steps.length && !tool.benefits.length)) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 mt-24 pt-16 border-t border-outline-variant/10 space-y-16" aria-label={`${tool.h1} guide and FAQ`}>
      {tool.steps.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-4">How to use the {tool.h1}</h2>
          <p className="text-on-surface-variant mb-8 max-w-2xl">{tool.intro}</p>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.steps.map((step, i) => (
              <li key={step.name} className="bg-surface-container rounded-xl p-6">
                <div className="text-primary font-headline font-bold text-3xl mb-3">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-headline font-bold mb-2">{step.name}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tool.benefits.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-4">Why use this {tool.h1}?</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tool.benefits.map((b) => (
              <li key={b} className="bg-surface-container-low rounded-lg p-5 flex gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5" aria-hidden>check_circle</span>
                <span className="text-sm text-on-surface-variant leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-on-surface-variant/70 mt-6">
            Built and maintained by{" "}
            <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              WeboGrowth
            </a>
            , a web growth agency. Explore more free utilities on our{" "}
            <Link to="/" className="text-primary hover:underline">tools homepage</Link>.
          </p>
        </div>
      )}

      {tool.faqs.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {tool.faqs.map((faq) => (
              <details key={faq.q} className="bg-surface-container rounded-xl p-5 group">
                <summary className="font-headline font-bold cursor-pointer flex justify-between items-center gap-4 list-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180 group-[[open]]:rotate-180" aria-hidden>expand_more</span>
                </summary>
                <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ToolSeoSection;
