const express = require("express");
const users = require("../routers/users");
const games = require("../routers/games");
const cors = require("cors");
const likedGames = require("../routers/likedGames");
const favoritedGames = require("../routers/favoritedGames");
const newPost = require("../routers/postRouter");
const follow = require("../routers/follow");
module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api", users);
  app.use("/api", games);
  app.use("/api", likedGames);
  app.use("/api", favoritedGames);
  app.use("/api", newPost);
  app.use("/api", follow);
};
