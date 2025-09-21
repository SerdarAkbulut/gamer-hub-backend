const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./src/config/db");
const config = require("./src/config/appConfig");

dotenv.config();

const app = express();
app.use(express.json());

// Routerları buraya ekle
// app.use("/api/users", users);

app.get("/", (req, res) => {
  res.json({ message: "🚀 API çalışıyor!", baseUrl: config.apiBaseUrl });
});

app.get("/api/hello", async (req, res) => {
  try {
    // İsteğe bağlı olarak request bazlı bağlantı kontrolü
    await sequelize.authenticate();
    res.json({ message: "Merhaba dünya!", port: config.port });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Database bağlantısı başarısız", details: err.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`✅ Server http://localhost:${PORT} adresinde çalışıyor`);
  });
}
