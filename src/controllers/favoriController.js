const FavoriGames = require("../models/favoriGames");

const addOrUpdateFavoriGame = async (req, res) => {
  try {
    const user = req.user;
    const { gameId, gameName, gameImage, isFavorited } = req.body;

    if (!gameId || !gameName || !gameImage || isFavorited === undefined) {
      return res.status(400).json({ message: "Tüm alanlar zorunludur!" });
    }

    if (!user) {
      return res.status(401).json({ message: "Giriş yapmalısınız" });
    }

    const existingFavorite = await FavoriGames.findOne({
      where: { gameId, userId: user.id },
    });

    if (existingFavorite) {
      existingFavorite.isFavorited = isFavorited;
      await existingFavorite.save();
      return res.status(200).json({ message: "Favori güncellendi" });
    }

    await FavoriGames.create({
      gameId,
      gameName,
      gameImage,
      isFavorited,
      userId: user.id,
    });

    return res.status(200).json({ message: "Favorilere eklendi" });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ message: "Sunucu Hatası", error });
  }
};
exports.favoriGames = {
  addOrUpdateFavoriGame,
};
module.exports = { addOrUpdateFavoriGame };
