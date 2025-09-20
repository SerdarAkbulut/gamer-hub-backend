require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
};
