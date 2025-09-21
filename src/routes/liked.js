const { Router } = require("express");
const auth = require("../middleware/auth");
const {
  addOrUpdateLikedGame,
  getLikedGames,
  getUserLikedGames,
} = require("../controllers/likeController");

const router = Router();

router.post("/likedGames", auth, addOrUpdateLikedGame);
router.get("/likedGames", auth, getLikedGames);
router.get("/userLikedGames/:userId", getUserLikedGames);
module.exports = router;
