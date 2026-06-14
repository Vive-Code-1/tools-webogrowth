import { useState } from "react";
import { Twitter, Linkedin, Facebook, Link2, Check, Send } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  variant?: "default" | "compact";
}

const ShareButtons = ({ url, title, description = "", hashtags = [], variant = "default" }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const tags = hashtags.join(",");
  const tweet = `${title}${tags ? `\n\nvia @webogrowth` : ""}`;

  const links = [
    {
      name: "Twitter",
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${enc(tweet)}&url=${enc(url)}${tags ? `&hashtags=${enc(tags)}` : ""}`,
      color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40",
    },
    {
      name: "LinkedIn",
      Icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/40",
    },
    {
      name: "Facebook",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/40",
    },
    {
      name: "Telegram",
      Icon: Send,
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`,
      color: "hover:bg-[#0088cc]/10 hover:text-[#0088cc] hover:border-[#0088cc]/40",
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest transition-all text-on-surface-variant";
  const size = variant === "compact" ? "h-9 w-9" : "h-10 px-4 text-sm font-medium";

  return (
    <div className="not-prose">
      {variant === "default" && (
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-3">Share this article</p>
      )}
      <div className="flex flex-wrap gap-2">
        {links.map(({ name, Icon, href, color }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${name}`}
            className={`${baseBtn} ${size} ${color}`}
          >
            <Icon className="w-4 h-4" />
            {variant === "default" && <span>{name}</span>}
          </a>
        ))}
        <button
          type="button"
          onClick={copy}
          aria-label="Copy link"
          className={`${baseBtn} ${size} hover:bg-primary/10 hover:text-primary hover:border-primary/40`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          {variant === "default" && <span>{copied ? "Copied!" : "Copy link"}</span>}
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
