function requireAuth(req, res, next) {
  if (req.session?.isAdmin) {
    next();
    return;
  }

  res.status(401).json({ error: "Authentication required.", errorSk: "Musíte byť prihlásený." });
}

module.exports = requireAuth;
