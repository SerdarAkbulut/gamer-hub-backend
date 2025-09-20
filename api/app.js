const serverless = require("serverless-http");
const express = require("express");
const app = express();
const sequelize = require("../src/startup/db");

app.use(express.json());

// const userRoutes = require("../src/routes/userRoutes");
// const postRoutes = require("../src/routes/postRoutes");

// app.use("/users", userRoutes);
// app.use("/posts", postRoutes);

sequelize
  .authenticate()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

module.exports = serverless(app);
