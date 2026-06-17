require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const articlesRouter = require("./routes/articles");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
const contentRouter = require("./routes/content");

require("./db");

const app = express();
const rootDir = path.join(__dirname, "..");

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "r-school-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use("/api/articles", articlesRouter);
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/content", contentRouter);
app.use("/uploads", express.static(path.join(__dirname, "data", "uploads")));

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(rootDir, "admin.html"));
});

app.use(express.static(rootDir));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

module.exports = app;
