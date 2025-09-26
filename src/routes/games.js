const {
  fetchGames,
  fetchReleaseDates,
  gameDetails,
  gameGenres,
  gameThemes,
  searchGames,
  upcomingGames,
  getUserLikedGamesWithDetails,
  getUserFavoritedGamesWithDetails,
} = require("../controllers/gamesController");
const { Router } = require("express");
const optionalAuth = require("../middleware/optionalAuth ");
const router = Router();

router.get("/games", optionalAuth, async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;

    const offset = (page - 1) * 24;
    const games = await fetchGames(offset, user ? user.id : null);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/search", optionalAuth, async (req, res) => {
  try {
    const user = req.user;
    const searchQuery = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * 24;
    if (!searchQuery) {
      return res.status(400).json({ error: "Arama terimi belirtilmelidir!" });
    }

    const games = await searchGames(searchQuery, offset, user ? user.id : null);
    return res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/gameDetails", optionalAuth, async (req, res) => {
  try {
    const gameId = req.query.id;
    const games = await gameDetails(gameId);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/gameGenres", async (req, res) => {
  try {
    const games = await gameGenres();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/gameThemes", async (req, res) => {
  try {
    const games = await gameThemes();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/newestGames", optionalAuth, async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * 24;
    const games = await fetchReleaseDates(offset, user ? user.id : null);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/upcomingGames", optionalAuth, async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * 24;
    const games = await upcomingGames(offset, user ? user.id : null);
    res.json(games);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.get("/userLikedGames/:userId", optionalAuth, async (req, res) => {
  const { userId } = req.params;
  const games = await getUserLikedGamesWithDetails(userId);
  res.json(games);
});
module.exports = router;
router.get("/userFavoritedGames/:userId", optionalAuth, async (req, res) => {
  const { userId } = req.params;
  const games = await getUserFavoritedGamesWithDetails(userId);
  res.json(games);
});
