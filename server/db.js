const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const storePath = path.join(dataDir, "articles-store.json");
const seedPath = path.join(__dirname, "..", "data", "articles.json");

fs.mkdirSync(dataDir, { recursive: true });

const SLUG_DIACRITICS = {
  á: "a", ä: "a", č: "c", ď: "d", é: "e", í: "i", ĺ: "l", ľ: "l", ň: "n",
  ó: "o", ô: "o", ŕ: "r", š: "s", ť: "t", ú: "u", ý: "y", ž: "z",
};

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function readStore() {
  if (!fs.existsSync(storePath)) {
    return { articles: [] };
  }

  try {
    const parsed = readJsonFile(storePath);
    return { articles: Array.isArray(parsed.articles) ? parsed.articles : [] };
  } catch {
    return { articles: [] };
  }
}

function writeStore(store) {
  fs.writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function normalizeArticle(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
    date: article.date,
    featured: Boolean(article.featured),
    heroStyle: ["large", "medium", "small", "none"].includes(article.heroStyle) ? article.heroStyle : "large",
    content: Array.isArray(article.content) ? article.content : [],
    sections: Array.isArray(article.sections) ? article.sections : [],
    created_at: article.created_at || new Date().toISOString(),
    updated_at: article.updated_at || new Date().toISOString(),
  };
}

function getAllArticles() {
  const store = readStore();
  return store.articles
    .map(normalizeArticle)
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.created_at.localeCompare(a.created_at);
    });
}

function getArticleBySlug(slug) {
  const store = readStore();
  const article = store.articles.find((item) => item.slug === slug);
  return article ? normalizeArticle(article) : null;
}

function getArticleById(id) {
  const store = readStore();
  const article = store.articles.find((item) => item.id === id);
  return article ? normalizeArticle(article) : null;
}

function createSlug(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => SLUG_DIACRITICS[char] || char)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function ensureUniqueSlug(baseSlug, excludeId = null) {
  const store = readStore();
  let slug = baseSlug;
  let counter = 1;

  while (store.articles.some((item) => item.slug === slug && item.id !== excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function createArticle(data) {
  const store = readStore();
  const id = data.id || ensureUniqueSlug(createSlug(data.title));
  const slug = ensureUniqueSlug(data.slug || createSlug(data.title));
  const now = new Date().toISOString();

  const article = normalizeArticle({
    id,
    slug,
    title: data.title,
    excerpt: data.excerpt,
    image: data.image,
    date: data.date,
    featured: Boolean(data.featured),
    heroStyle: data.heroStyle,
    content: data.content,
    sections: data.sections,
    created_at: now,
    updated_at: now,
  });

  store.articles.push(article);
  writeStore(store);
  return article;
}

function updateArticle(id, data) {
  const store = readStore();
  const index = store.articles.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const slug = ensureUniqueSlug(data.slug || createSlug(data.title), id);
  const updated = normalizeArticle({
    ...store.articles[index],
    slug,
    title: data.title,
    excerpt: data.excerpt,
    image: data.image,
    date: data.date,
    featured: Boolean(data.featured),
    heroStyle: data.heroStyle,
    content: data.content,
    sections: data.sections,
    updated_at: new Date().toISOString(),
  });

  store.articles[index] = updated;
  writeStore(store);
  return updated;
}

function deleteArticle(id) {
  const store = readStore();
  const nextArticles = store.articles.filter((item) => item.id !== id);
  if (nextArticles.length === store.articles.length) return false;

  store.articles = nextArticles;
  writeStore(store);
  return true;
}

function seedFromJsonIfEmpty() {
  const store = readStore();
  if (store.articles.length > 0 || !fs.existsSync(seedPath)) return;

  const seed = readJsonFile(seedPath);
  (seed.articles || []).forEach((article) => createArticle(article));
  console.log(`Seeded ${seed.articles?.length || 0} articles from articles.json`);
}

seedFromJsonIfEmpty();

module.exports = {
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
