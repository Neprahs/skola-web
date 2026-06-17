const express = require("express");
const path = require("path");
const fs = require("fs");
const { getContentStore, mergePageContent } = require("../content-store");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const manifestPath = path.join(__dirname, "..", "..", "data", "editable-pages.json");

router.get("/manifest", (_req, res) => {
  if (!fs.existsSync(manifestPath)) {
    res.status(404).json({ error: "Editable pages manifest not found." });
    return;
  }

  const raw = fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "");
  res.json(JSON.parse(raw));
});

router.get("/", (_req, res) => {
  res.json(getContentStore());
});

router.put("/page/:pageId", requireAuth, (req, res) => {
  const { pageId } = req.params;
  const { lang, fields, images, blocks } = req.body || {};

  if (!lang || typeof lang !== "string") {
    res.status(400).json({ error: "Language is required." });
    return;
  }

  const store = mergePageContent(pageId, {
    lang,
    fields: fields && typeof fields === "object" ? fields : {},
    images: images && typeof images === "object" ? images : {},
    blocks: Array.isArray(blocks) ? blocks : undefined,
  });

  res.json({ success: true, store });
});

module.exports = router;
