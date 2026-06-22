const app = require("./app");
const os = require("os");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }
  return null;
}

function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const warnings = [];
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!password || password === "rschool2026") {
    warnings.push("Set ADMIN_PASSWORD to a strong password (not the default).");
  }
  if (!secret || secret === "r-school-dev-secret-change-me") {
    warnings.push("Set SESSION_SECRET to a long random string.");
  }

  if (warnings.length) {
    console.warn("Production security warnings:");
    warnings.forEach((message) => console.warn(`  - ${message}`));
  }
}

validateProductionEnv();

app.listen(PORT, HOST, () => {
  const lanIp = getLocalNetworkIp();
  console.log(`Rudník Primary School server running at http://localhost:${PORT}`);
  if (lanIp) {
    console.log(`School network admin URL: http://${lanIp}:${PORT}/admin`);
  }
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
