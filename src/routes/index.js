const express = require("express");
const users = require("./users");
const games = require("./games");
const cors = require("cors");
const likedGames = require("./likedGames");
const favoritedGames = require("./favoritedGames");
const newPost = require("./postRouter");
const follow = require("./follow");
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
module.exports = router;
