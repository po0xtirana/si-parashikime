import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const inputPath = path.join(root, "docs", "gazetasi-implementation-guide.html");
const outputPath = path.join(root, "docs", "gazetasi-implementation-guide.pdf");

const edgeCandidates = [
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const executablePath = edgeCandidates.find((candidate) => existsSync(candidate));

if (!executablePath) {
  console.error("No local Chromium-based browser found for PDF export.");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: true,
  executablePath,
});

const page = await browser.newPage();
await page.goto(pathToFileURL(inputPath).href, { waitUntil: "networkidle" });
await page.pdf({
  path: outputPath,
  format: "A4",
  margin: {
    top: "18mm",
    right: "14mm",
    bottom: "18mm",
    left: "14mm",
  },
  printBackground: true,
});

await browser.close();

console.log(`PDF exported to ${outputPath}`);
