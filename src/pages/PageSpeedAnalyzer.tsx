import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";

type Strategy = "mobile" | "desktop";

interface Metric {
  title: string;
  displayValue?: string;
  score?: number | null;
}

interface PsiResult {
  performanceScore: number;
  metrics: Metric[];
  opportunities: { title: string; description: string; displayValue?: string }[];
  finalUrl: string;
  strategy: Strategy;
}

const scoreColor = (s: number) => (s >= 90 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-rose-400");
const scoreBg = (s: number) => (s >= 90 ? "bg-emerald-400/10" : s >= 50 ? "bg-amber-400/10" : "bg-rose-400/10");

const PageSpeedAnalyzer = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PsiResult | null>(null);

  const handleAnalyze = async () => {
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;
    try {
      new URL(target);
    } catch {
      toast({ title: "Invalid URL", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(target)}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`PSI API error ${res.status}`);
      const data = await res.json();
      const lh = data.lighthouseResult;
      const audits = lh.audits;

      const metricsList: Metric[] = [
        { title: "First Contentful Paint", displayValue: audits["first-contentful-paint"]?.displayValue, score: audits["first-contentful-paint"]?.score },
        { title: "Largest Contentful Paint", displayValue: audits["largest-contentful-paint"]?.displayValue, score: audits["largest-contentful-paint"]?.score },
        { title: "Total Blocking Time", displayValue: audits["total-blocking-time"]?.displayValue, score: audits["total-blocking-time"]?.score },
        { title: "Cumulative Layout Shift", displayValue: audits["cumulative-layout-shift"]?.displayValue, score: audits["cumulative-layout-shift"]?.score },
        { title: "Speed Index", displayValue: audits["speed-index"]?.displayValue, score: audits["speed-index"]?.score },
      ];

      const opportunities = Object.values(audits)
        .filter((a: any) => a.details?.type === "opportunity" && a.score !== null && a.score < 0.9)
        .slice(0, 8)
        .map((a: any) => ({ title: a.title, description: a.description, displayValue: a.displayValue }));

      setResult({
        performanceScore: Math.round((lh.categories.performance?.score || 0) * 100),
        metrics: metricsList,
        opportunities,
        finalUrl: lh.finalUrl,
        strategy,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Analysis failed", description: "Google PSI rate-limited or site unreachable. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead {...getSeoProps("/pagespeed-analyzer")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">SEO & Performance</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            PageSpeed <br /><span className="text-secondary">Analyzer</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Audit any URL for Core Web Vitals — LCP, CLS, INP — with Google Lighthouse. Get the same performance score Google uses for rankings.
          </p>
        </header>

        <div className="bg-surface-container rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="https://example.com"
              className="flex-1 bg-surface-container-lowest rounded-lg px-5 py-3 outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex bg-surface-container-lowest rounded-lg p-1">
              {(["mobile", "desktop"] as Strategy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStrategy(s)}
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${strategy === s ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !url}
              className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg disabled:opacity-50 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant">Running Lighthouse audit… 20–40 seconds.</p>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            <div className="bg-surface-container rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className={`w-32 h-32 rounded-full ${scoreBg(result.performanceScore)} flex items-center justify-center`}>
                <span className={`text-5xl font-headline font-bold ${scoreColor(result.performanceScore)}`}>{result.performanceScore}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-headline font-bold mb-2">Performance Score</h3>
                <p className="text-on-surface-variant text-sm break-all mb-1">{result.finalUrl}</p>
                <p className="text-xs uppercase tracking-widest text-primary font-bold">{result.strategy} · Google Lighthouse</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-headline font-bold mb-4">Core Web Vitals</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {result.metrics.map((m) => (
                  <div key={m.title} className="bg-surface-container rounded-xl p-4">
                    <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">{m.title}</p>
                    <p className={`text-xl font-headline font-bold ${m.score !== null && m.score !== undefined ? scoreColor(m.score * 100) : ""}`}>
                      {m.displayValue || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {result.opportunities.length > 0 && (
              <div>
                <h3 className="text-xl font-headline font-bold mb-4">Optimization Opportunities</h3>
                <div className="space-y-3">
                  {result.opportunities.map((op) => (
                    <details key={op.title} className="bg-surface-container rounded-xl p-5 group">
                      <summary className="font-bold cursor-pointer flex justify-between items-center gap-4 list-none [&::-webkit-details-marker]:hidden">
                        <span>{op.title}</span>
                        <span className="text-sm text-amber-400 font-mono">{op.displayValue}</span>
                      </summary>
                      <p className="text-sm text-on-surface-variant mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: op.description.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-primary hover:underline">$1</a>') }} />
                    </details>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center">
              <h4 className="text-xl font-headline font-bold mb-2">Need a deeper audit?</h4>
              <p className="text-on-surface-variant text-sm mb-4">Get a full technical SEO + performance audit from WeboGrowth.</p>
              <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="inline-block bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all">
                Talk to WeboGrowth
              </a>
            </div>
          </div>
        )}

        <ToolSeoSection path="/pagespeed-analyzer" />
        <RelatedTools currentPath="/pagespeed-analyzer" />
      </div>
    </>
  );
};

export default PageSpeedAnalyzer;
