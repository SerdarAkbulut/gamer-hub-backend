const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/db");
const config = require("./src/config/appConfig");
const gamesRoutes = require("./src/routes/games");
const favoritedRoutes = require("./src/routes/favorited");
const likedGames = require("./src/routes/liked");
const post = require("./src/routes/post");
const follow = require("./src/routes/follow");
const app = express();
const modelIndex = require("./src/models/index");
app.use(cors());
app.use(express.json());
app.use("/api", gamesRoutes);
app.use("/api", favoritedRoutes);
app.use("/api", likedGames);
app.use("/api", post);
app.use("/api", follow);
app.get("/", (req, res) => {
  res.json({ message: "🚀 API çalışıyor!", baseUrl: config.apiBaseUrl });
});

app.get("/api/hello", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: "DB bağlantısı başarılı!", port: config.port });
  } catch (err) {
    res
      .status(500)
      .json({ error: "DB bağlantısı başarısız", details: err.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`✅ Server http://localhost:${PORT} adresinde çalışıyor`);
  });
}
