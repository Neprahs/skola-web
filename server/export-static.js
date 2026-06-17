// Exports locally edited content into static files for publishing (e.g. Vercel).
// Run from the project: node server/export-static.js  (or: npm run export)
//
// It copies:
//   server/data/articles-store.json  -> data/articles.json        (news)
//   server/data/content-store.json   -> data/site-content.json    (page texts/photos/sections)
//   server/uploads/*                 -> uploads/                   (uploaded photos)

const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const serverDataDir = path.join(__dirname, "data");
const serverUploadsDir = path.join(serverDataDir, "uploads");
const publicDataDir = path.join(rootDir, "data");
const publicUploadsDir = path.join(rootDir, "uploads");

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function exportArticles() {
  const store = readJson(path.join(serverDataDir, "articles-store.json"), { articles: [] });
  const articles = Array.isArray(store.articles) ? store.articles : [];
  writeJson(path.join(publicDataDir, "articles.json"), { articles });
  console.log(`Exported ${articles.length} articles -> data/articles.json`);
}

function exportContent() {
  const store = readJson(path.join(serverDataDir, "content-store.json"), {
    overrides: {},
    images: {},
    blocks: {},
  });
  writeJson(path.join(publicDataDir, "site-content.json"), store);
  console.log("Exported page content -> data/site-content.json");
}

function exportUploads() {
  if (!fs.existsSync(serverUploadsDir)) {
    console.log("No uploads to export.");
    return;
  }

  fs.mkdirSync(publicUploadsDir, { recursive: true });
  const files = fs.readdirSync(serverUploadsDir).filter((name) => name !== ".gitkeep");

  files.forEach((name) => {
    fs.copyFileSync(path.join(serverUploadsDir, name), path.join(publicUploadsDir, name));
  });

  console.log(`Copied ${files.length} photo(s) -> uploads/`);
}

exportArticles();
exportContent();
exportUploads();
console.log("\nHotovo! Teraz nahrajte zmeny na web (git push / Vercel).");
