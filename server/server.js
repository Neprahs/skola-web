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

app.listen(PORT, HOST, () => {
  const lanIp = getLocalNetworkIp();
  console.log(`Rudník Primary School server running at http://localhost:${PORT}`);
  if (lanIp) {
    console.log(`School network admin URL: http://${lanIp}:${PORT}/admin`);
  }
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
