const axios = require("axios");
const Post = require("../models/postModel");
const { User } = require("../models/userModel");
const { LikedGames, favoritedGames } = require("../models");
const getOAuthToken = async () => {
  try {
    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Twitch Token Hatası:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};
const getUserLikedGames = async (userId) => {
  return await LikedGames.findAll({
    where: {
      userId: userId,
    },
    attributes: ["gameId", "isLiked"],
  });
};
const getGamePosts = async (gameId) => {
  return await Post.findAll({
    where: { gameId: gameId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["userName"],
      },
    ],
  });
};

const getUserFavoritedGames = async (userId) => {
  return await favoritedGames.findAll({
    where: {
      userId: userId,
    },
    attributes: ["gameId", "isFavorited"],
  });
};

const fetchReleaseDates = async (offset = 0, userId = null) => {
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) throw new Error("Access token alınamadı!");

    const currentTime = Math.floor(Date.now() / 1000);

    const requestBody = `
      fields name, cover.image_id, first_release_date;
      sort first_release_date desc;
      where first_release_date < ${currentTime} 
      & category = (0)
      & version_parent = null
      & themes !=(42);
      limit 24;
      offset ${offset};
    `;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": process.env.CLIENT_ID,
          Accept: "application/json",
        },
      }
    );

    let games = response.data.map((game) => ({
      ...game,
      first_release_date: game.first_release_date
        ? new Date(game.first_release_date * 1000).toLocaleDateString("tr-TR")
        : "Bilinmiyor",
      cover_url: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
        : "default-cover.jpg",
    }));

    if (userId) {
      const likedGames = await getUserLikedGames(userId);
      const favoritedGames = await getUserFavoritedGames(userId);

      games = games.map((game) => {
        const likedGame = likedGames.find((lg) => lg.gameId === game.id);
        const favoritedGame = favoritedGames.find(
          (fv) => fv.gameId === game.id
        );
        return {
          ...game,
          isLiked: likedGame ? likedGame.isLiked : null,
          isFavorited: favoritedGame ? favoritedGame.isFavorited : false,
        };
      });
    } else {
      // userId yoksa default değerleri ata
      games = games.map((game) => ({
        ...game,
        isLiked: null,
        isFavorited: false,
      }));
    }

    return games;
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
};

const fetchGames = async (offset = 0, userId = null) => {
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) throw new Error("Access token alınamadı!");

    const currentTime = Math.floor(Date.now() / 1000);
    const requestBody = `
      fields name, cover.image_id; 
      sort rating desc;
      where first_release_date <= ${currentTime};
      limit 24;
      offset ${offset};
    `;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": process.env.CLIENT_ID,
          Accept: "application/json",
        },
      }
    );

    let games = response.data.map((game) => ({
      ...game,
      cover_url: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
        : "default-cover.jpg",
    }));

    if (userId) {
      const likedGames = await getUserLikedGames(userId);
      const favoritedGames = await getUserFavoritedGames(userId);

      games = games.map((game) => {
        const likedGame = likedGames.find((lg) => lg.gameId === game.id);
        const favoritedGame = favoritedGames.find(
          (fv) => fv.gameId === game.id
        );
        return {
          ...game,
          isLiked: likedGame ? likedGame.isLiked : null,
          isFavorited: favoritedGame ? favoritedGame.isFavorited : false,
          userId: userId,
        };
      });
    } else {
      games = games.map((game) => ({
        ...game,
        isLiked: null,
        isFavorited: false,
        userId: userId,
      }));
    }

    return games;
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
};

const searchGames = async (search, offset = 0, userId = null) => {
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) {
      throw new Error("Access token alınamadı!");
    }

    const requestBody = `
      fields name, genres.name, first_release_date, cover.url, cover.image_id;
      search "${search}";
      limit 24;
      offset ${offset}; 
    `;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": process.env.CLIENT_ID,
          Accept: "application/json",
        },
      }
    );

    let games = response.data.map((game) => ({
      ...game,
      cover_url: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
        : "default-cover.jpg",
    }));

    if (userId) {
      const likedGames = await getUserLikedGames(userId);
      const favoritedGames = await getUserFavoritedGames(userId);

      games = games.map((game) => {
        const likedGame = likedGames.find((lg) => lg.gameId === game.id);
        const favoritedGame = favoritedGames.find(
          (fv) => fv.gameId === game.id
        );
        return {
          ...game,
          isLiked: likedGame ? likedGame.isLiked : null,
          isFavorited: favoritedGame ? favoritedGame.isFavorited : false,
          userId: userId,
        };
      });
    } else {
      games = games.map((game) => ({
        ...game,
        isLiked: null,
        isFavorited: false,
        userId: userId,
      }));
    }

    return games;
  } catch (error) {
    console.error("Error Response Data:", error.response?.data);
    console.error("Error Message:", error.message);
    return [];
  }
};
const upcomingGames = async (offset = 0, userId = null) => {
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) throw new Error("Access token alınamadı!");

    const currentTime = Math.floor(Date.now() / 1000);

    const requestBody = `
      fields name, cover.image_id;
      sort first_release_date asc;
      where first_release_date > ${currentTime}
      & version_parent = null
      & themes != 42;
      limit 24;
      offset ${offset};
    `;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": process.env.CLIENT_ID,
          Accept: "application/json",
        },
      }
    );

    let games = response.data.map((game) => ({
      ...game,
      cover_url: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
        : "default-cover.jpg",
    }));

    // Kullanıcı giriş yapmışsa beğenileri ve favorileri ekle
    if (userId) {
      const likedGames = await getUserLikedGames(userId);
      const favoritedGames = await getUserFavoritedGames(userId);

      games = games.map((game) => {
        const likedGame = likedGames.find((lg) => lg.gameId === game.id);
        const favoritedGame = favoritedGames.find(
          (fv) => fv.gameId === game.id
        );
        return {
          ...game,
          isLiked: likedGame ? likedGame.isLiked : null,
          isFavorited: favoritedGame ? favoritedGame.isFavorited : false,
        };
      });
    } else {
      // userId yoksa default değerleri ata
      games = games.map((game) => ({
        ...game,
        isLiked: null,
        isFavorited: false,
      }));
    }

    return games;
  } catch (error) {
    console.error("Error:", error.message);
    return error.message;
  }
};
const gameDetails = async (gameId) => {
  const accessToken = await getOAuthToken();
  const requestBody = `
  fields name,genres.name,platforms.name,themes.name,screenshots.url;
  where id = ${gameId};
  limit 1;
`;
  const response = await axios.post(
    "https://api.igdb.com/v4/games",
    requestBody,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": process.env.CLIENT_ID,
        Accept: "application/json",
      },
    }
  );
  const games = await Promise.all(
    response.data.map(async (game) => {
      // gameId'yi almak
      const gameId = game.id; // Oyunla ilgili gameId'yi burada almak gerekebilir

      // gamePosts'u almak
      const gamePosts = gameId ? await getGamePosts(gameId) : [];

      // Oyunla ilgili verileri işleyip dönüyoruz
      return {
        name: game.name,
        genres: game.genres
          ? game.genres.map((genre) => genre.name).join(", ")
          : "",
        platforms: game.platforms
          ? game.platforms.map((platform) => platform.name).join(", ")
          : "",
        themes: game.themes
          ? game.themes.map((theme) => theme.name).join(", ")
          : "",
        screenshots: Array.isArray(game.screenshots)
          ? game.screenshots.map((screenshot) => ({
              url: screenshot.url.replace("/t_thumb/", "/t_1080p/"),
            }))
          : [],
        gamePosts,
      };
    })
  );
  return games;
};
const gameGenres = async () => {
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) {
      throw new Error("Access token alınamadı!");
    }

    const requestBody = `
      fields name;
      limit 50;
    `;

    const response = await fetch("https://api.igdb.com/v4/genres", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": process.env.CLIENT_ID,
        "Content-Type": "text/plain",
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    let games = await response.json();

    return games;
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
};

const gameThemes = async () => {
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) {
      throw new Error("Access token alınamadı!");
    }

    const requestBody = `
      fields name;
      limit 50;
    `;

    const response = await fetch("https://api.igdb.com/v4/themes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": process.env.CLIENT_ID,
        "Content-Type": "text/plain",
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    let games = await response.json();

    return games;
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
};
const getUserLikedGamesWithDetails = async (userId) => {
  try {
    const likedGames = await getUserLikedGames(userId);

    if (!likedGames || likedGames.length === 0) {
      return [];
    }

    const likedGameIds = likedGames
      .filter((lg) => lg.isLiked)
      .map((lg) => lg.gameId);

    if (likedGameIds.length === 0) {
      return [];
    }

    const accessToken = await getOAuthToken();
    if (!accessToken) throw new Error("Access token alınamadı!");

    const requestBody = `
      fields id, name, cover.image_id; 
      where id = (${likedGameIds.join(",")});
      limit ${likedGameIds.length};
    `;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": process.env.CLIENT_ID,
          Accept: "application/json",
        },
      }
    );

    const games = response.data.map((game) => ({
      ...game,
      cover_url: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
        : "default-cover.jpg",
      isLiked: true, // çünkü zaten liked
      userId,
    }));

    return games;
  } catch (error) {
    console.error("Error getUserLikedGamesWithDetails:", error.message);
    return [];
  }
};
const getUserFavoritedGamesWithDetails = async (userId) => {
  try {
    const accessToken = await getOAuthToken();
    if (!accessToken) throw new Error("Access token alınamadı!");

    // Kullanıcının favori oyunlarını DB'den çek
    const favoritedGames = await getUserFavoritedGames(userId);
    const favoritedGameIds = favoritedGames
      .filter((fv) => fv.isFavorited) // sadece favoriler
      .map((fv) => fv.gameId);

    if (favoritedGameIds.length === 0) {
      return []; // Favori oyun yoksa boş dön
    }

    // IGDB'den sadece bu oyunları çek
    const requestBody = `
      fields name, cover.image_id, first_release_date, rating; 
      where id = (${favoritedGameIds.join(",")});
      limit ${favoritedGameIds.length};
    `;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": process.env.CLIENT_ID,
          Accept: "application/json",
        },
      }
    );

    // IGDB verilerini düzenle
    let games = response.data.map((game) => ({
      ...game,
      cover_url: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`
        : "default-cover.jpg",
      isFavorited: true,
      isLiked: false,
      userId: userId,
    }));

    // Kullanıcının beğendiği oyunlarla eşleştir
    const likedGames = await getUserLikedGames(userId);
    games = games.map((game) => {
      const liked = likedGames.find((lg) => lg.gameId === game.id);
      return {
        ...game,
        isLiked: liked ? liked.isLiked : false,
      };
    });

    return games;
  } catch (error) {
    console.error("Error getUserFavoritedGamesWithDetails:", error.message);
    return [];
  }
};
exports.games = {
  fetchGames,
  searchGames,
  gameDetails,
  gameGenres,
  gameThemes,
  fetchReleaseDates,
  upcomingGames,
  getUserLikedGames,
  getUserFavoritedGames,
  getUserLikedGamesWithDetails,
  getUserFavoritedGamesWithDetails,
};
module.exports = {
  fetchGames,
  searchGames,
  gameDetails,
  gameGenres,
  gameThemes,
  fetchReleaseDates,
  upcomingGames,
  getUserLikedGames,
  getUserFavoritedGames,
  getUserLikedGamesWithDetails,
  getUserFavoritedGamesWithDetails,
};
