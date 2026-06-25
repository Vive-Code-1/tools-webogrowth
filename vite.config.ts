import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Count tools defined in src/lib/tools.ts at build/serve time so that
// the static index.html title/description stay in sync with the registry.
function countToolsFromSource(): number {
  try {
    const src = fs.readFileSync(path.resolve(__dirname, "src/lib/tools.ts"), "utf8");
    // Each tool entry in toolCategories has a `path:` field. Count those.
    const matches = src.match(/^\s*\{\s*name:\s*["'`]/gm);
    if (matches && matches.length > 0) return matches.length;
    // Fallback: count `path:` occurrences inside tools array.
    const pathMatches = src.match(/\bpath:\s*["'`]\//g);
    return pathMatches ? pathMatches.length : 17;
  } catch {
    return 17;
  }
}

function dynamicToolCountHtml(): Plugin {
  return {
    name: "dynamic-tool-count-html",
    transformIndexHtml(html) {
      const total = countToolsFromSource();
      const label = `${total}+`;
      return html
        .replace(/%TOTAL_TOOLS_LABEL%/g, label)
        .replace(/%TOTAL_TOOLS%/g, String(total));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), dynamicToolCountHtml(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast", "@radix-ui/react-tooltip"],
          "motion-vendor": ["framer-motion"],
          "lottie-vendor": ["lottie-react"],
          "query-vendor": ["@tanstack/react-query"],
        },
      },
    },
  },
}));
