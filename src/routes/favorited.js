const { Router } = require("express");
const auth = require("../middleware/auth");
const { addOrUpdateFavoriGame } = require("../controllers/favoriController");

const router = Router();

router.post("/favoriGames", auth, addOrUpdateFavoriGame);

module.exports = router;
