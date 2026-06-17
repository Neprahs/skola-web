const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const storePath = path.join(dataDir, "content-store.json");

fs.mkdirSync(dataDir, { recursive: true });

function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;

  try {
    const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function defaultStore() {
  return {
    overrides: {},
    images: {},
    blocks: {},
  };
}

function getContentStore() {
  return readJsonFile(storePath, defaultStore());
}

function saveContentStore(store) {
  const normalized = {
    overrides: store.overrides || {},
    images: store.images || {},
    blocks: store.blocks || {},
  };
  writeJsonFile(storePath, normalized);
  return normalized;
}

function mergePageContent(pageId, payload) {
  const store = getContentStore();
  const { lang = "sk", fields = {}, images = {}, blocks } = payload;

  if (!store.overrides[lang]) store.overrides[lang] = {};
  Object.assign(store.overrides[lang], fields);

  Object.entries(images).forEach(([key, value]) => {
    store.images[key] = value;
  });

  if (Array.isArray(blocks)) {
    store.blocks[pageId] = blocks;
  }

  return saveContentStore(store);
}

module.exports = {
  getContentStore,
  saveContentStore,
  mergePageContent,
};
