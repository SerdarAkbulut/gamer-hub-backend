const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// Basit test endpoint
app.get("/", (req, res) => {
  res.json({ message: "🚀 API çalışıyor!" });
});

// Örnek başka endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Merhaba dünya!" });
});

// Vercel için export
module.exports = app;

// Local development için port açma
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server http://localhost:${PORT} adresinde çalışıyor`);
  });
}
