const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");

const DATABASE_URL =
  "postgresql://postgres.iofgthwhmfcjlezhczja:B0eczGBMpbYBhKzw@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "🚀 API çalışıyor!" }));

app.get("/api/hello", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: "DB bağlantısı başarılı!" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "DB bağlantısı başarısız", details: err.message });
  }
});

module.exports = app;
