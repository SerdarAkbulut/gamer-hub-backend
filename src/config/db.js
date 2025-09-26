const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

if (process.env.NODE_ENV !== "production") {
  sequelize
    .authenticate()
    .then(() => console.log("✅ PostgreSQL bağlantısı başarılı."))
    .catch((err) => console.error("❌ PostgreSQL bağlantı hatası:", err));
}

module.exports = sequelize;
