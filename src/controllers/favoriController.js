const { where } = require("sequelize");
const FavoriGames = require("../models/favoritedGames");
const { User } = require("../models/userModel");

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

const getFavoriGames = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Giriş yapmalısınız" });
    }

    const favoriGames = await FavoriGames.findAll({
      where: { userId: user.id },
      attributes: [
        ["gameImage", "cover_url"][("gameName", "name")],
        "gameId",
        "isFavorited",
      ],
    });

    return res.status(200).json(favoriGames);
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ message: "Sunucu Hatası", error });
  }
};

const getUserFavoriGames = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByPk(userId);
  if (!userId || !user) {
    return res.status(401).json({ message: "Kullanıcı bulunamadı" });
  }
  try {
    const favoriteGames = await FavoriGames.findAll({
      where: { userId: userId, isFavorited: true },
      attributes: [
        ["gameImage", "cover_url"],
        ["gameName", "name"],
        "gameId",
        "isFavorited",
      ],
    });
    if (favoriteGames == null || favoriteGames.length > 0) {
      res.status(200).json({ message: "Kullanıcının favori oyunu bulunamadı" });
    }
    return res.status(200).json(favoriteGames);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.favoriGames = {
  addOrUpdateFavoriGame,
  getFavoriGames,
  getUserFavoriGames,
};
module.exports = {
  addOrUpdateFavoriGame,
  getFavoriGames,
  getUserFavoriGames,
};
