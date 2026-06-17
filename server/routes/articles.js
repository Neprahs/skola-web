const express = require("express");
const {
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ articles: getAllArticles() });
});

router.get("/:slug", (req, res) => {
  const article = getArticleBySlug(req.params.slug);
  if (!article) {
    res.status(404).json({ error: "Article not found." });
    return;
  }
  res.json(article);
});

router.post("/", require("../middleware/requireAuth"), (req, res) => {
  const { title, excerpt, image, date, featured, content, sections, heroStyle } = req.body;

  if (!title || !excerpt || !image || !date || !Array.isArray(content) || !content.length) {
    res.status(400).json({ error: "Missing required article fields." });
    return;
  }

  const article = createArticle({
    title,
    excerpt,
    image,
    date,
    featured: Boolean(featured),
    content,
    sections: Array.isArray(sections) ? sections : [],
    heroStyle,
  });

  res.status(201).json(article);
});

router.put("/:id", require("../middleware/requireAuth"), (req, res) => {
  const existing = getArticleById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Article not found." });
    return;
  }

  const { title, excerpt, image, date, featured, content, sections, heroStyle } = req.body;

  if (!title || !excerpt || !image || !date || !Array.isArray(content) || !content.length) {
    res.status(400).json({ error: "Missing required article fields." });
    return;
  }

  const article = updateArticle(req.params.id, {
    title,
    excerpt,
    image,
    date,
    featured: Boolean(featured),
    content,
    sections: Array.isArray(sections) ? sections : [],
    heroStyle,
  });

  res.json(article);
});

router.delete("/:id", require("../middleware/requireAuth"), (req, res) => {
  const deleted = deleteArticle(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Article not found." });
    return;
  }
  res.json({ success: true });
});

module.exports = router;
