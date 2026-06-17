const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "data", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.\-]/g, "-")
      .replace(/-+/g, "-");
    const unique = `${Date.now()}-${safeName}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed."));
  },
});

router.post("/", requireAuth, (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No image uploaded." });
      return;
    }

    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
