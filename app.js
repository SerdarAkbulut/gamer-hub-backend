const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./src/config/db");
const config = require("./src/config/appConfig");

dotenv.config();

const app = express();
app.use(express.json());

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostgreSQL bağlantısı başarılı.");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL bağlantı hatası:", err);
  });

app.get("/", (req, res) => {
  res.json({ message: "🚀 API çalışıyor!", baseUrl: config.apiBaseUrl });
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Merhaba dünya!", port: config.port });
});

module.exports = app;

if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`✅ Server http://localhost:${PORT} adresinde çalışıyor`);
  });
}
