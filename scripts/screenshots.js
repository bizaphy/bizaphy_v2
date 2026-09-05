// @ts-check
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.argv[2] || "http://localhost:3000";

const PROJECTS = [
  { slug: "habit-tracker", title: "Habit Tracker" },
  { slug: "market-dashboard", title: "Market Dashboard" },
  { slug: "tic-tac-toe", title: "Tic Tac Toe" },
  { slug: "translation-checker", title: "Translation Checker" },
  { slug: "weather-dashboard", title: "Weather Dashboard" },
  { slug: "global-time-report", title: "Global Time Report" },
  { slug: "hangman", title: "Hangman" },
];

const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "projects");

async function takeScreenshots() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log(`Base URL: ${BASE_URL}\n`);

  for (const project of PROJECTS) {
    const url = `${BASE_URL}/projects/${project.slug}`;
    const outputPath = path.join(OUTPUT_DIR, `${project.slug}.png`);

    try {
      process.stdout.write(`  ${project.title}... `);
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      await page.screenshot({ path: outputPath, fullPage: false });
      console.log(`✓`);
    } catch (err) {
      console.log(`✗ (${err.message})`);
    }
  }

  await browser.close();
  console.log(`\nScreenshots guardados en: public/images/projects/`);
}

takeScreenshots();
