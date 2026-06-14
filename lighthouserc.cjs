module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:4173/",
        "http://localhost:4173/compressor",
        "http://localhost:4173/json-formatter",
        "http://localhost:4173/qr-code",
        "http://localhost:4173/meta-tag-generator",
        "http://localhost:4173/gradient-generator",
      ],
      startServerCommand: "npm run preview -- --port=4173 --strictPort",
      startServerReadyPattern: "Local:",
      numberOfRuns: 2,
      settings: { preset: "desktop", chromeFlags: "--no-sandbox --headless=new" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
    upload: { target: "filesystem", outputDir: "./reports/lighthouse" },
  },
};
