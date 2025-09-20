const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./src/startup/db.js");
require("./src/models/index.js");

dotenv.config();
const app = express();
app.use(express.json());
require("./src/startup/routers")(app);

sequelize
  .authenticate()
  .then(() => console.log("✅ Veritabanı bağlantısı başarılı."))
  .catch((err) => console.error("❌ Bağlantı hatası:", err));

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`));

module.exports = app;
