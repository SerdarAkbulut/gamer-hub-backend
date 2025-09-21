const { Router } = require("express");
const auth = require("../middleware/auth");
const {
  addOrUpdateFavoriGame,
  getFavoriGames,
  getUserFavoriGames,
} = require("../controllers/favoriController");

const router = Router();

router.post("/favoriGames", auth, addOrUpdateFavoriGame);
router.get("/favoriGames", auth, getFavoriGames);
router.get("/userFavoriGames/:userId", getUserFavoriGames);
module.exports = router;
