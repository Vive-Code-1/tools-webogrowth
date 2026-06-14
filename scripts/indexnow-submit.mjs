#!/usr/bin/env node
/**
 * Submits every URL from public/sitemap.xml to IndexNow.
 * IndexNow is supported by Bing, Yandex, Seznam, Naver — and signals reach Google indirectly.
 * Usage: node scripts/indexnow-submit.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const HOST = "tools.webogrowth.com";
const KEY = "02a13238b42e97d3a8ff90893f5215d6";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = resolve("public/sitemap.xml");

const xml = readFileSync(SITEMAP, "utf8");
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());

if (urls.length === 0) {
  console.error("No URLs found in sitemap.xml");
  process.exit(1);
}

const endpoints = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/IndexNow",
  "https://yandex.com/indexnow",
];

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

console.log(`Submitting ${urls.length} URLs to IndexNow...`);

for (const url of endpoints) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    console.log(`  ${url} → ${res.status} ${res.statusText}`);
  } catch (e) {
    console.error(`  ${url} → ERROR`, e.message);
  }
}

// Also ping Google + Bing about sitemap freshness (legacy ping, still works)
const sitemapUrl = encodeURIComponent(`https://${HOST}/sitemap.xml`);
for (const ping of [
  `https://www.google.com/ping?sitemap=${sitemapUrl}`,
  `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
]) {
  try {
    const res = await fetch(ping);
    console.log(`  ping ${ping} → ${res.status}`);
  } catch (e) {
    console.error(`  ping ${ping} → ERROR`, e.message);
  }
}

console.log("Done.");
