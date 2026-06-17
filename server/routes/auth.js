const express = require("express");

const router = express.Router();

router.post("/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "rschool2026";

  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  req.session.isAdmin = true;
  res.json({ success: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/check", (req, res) => {
  res.json({ authenticated: Boolean(req.session?.isAdmin) });
});

module.exports = router;
