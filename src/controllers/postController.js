const Post = require("../models/postModel");
const { User } = require("../models/userModel");
const SavedPost = require("../models/savedPost");
const UserPostFeatured = require("../models/UserPostFeatured");

const addPost = async (req, res) => {
  try {
    const user = req.user;
    const { gameId, gameName, postTitle, postText } = req.body;
    if ((!gameId, !gameName, !postTitle, !postText)) {
      return res.status(400).json({ message: "Tüm alanları doldurun" });
    }
    if (!user) {
      return res.status(401).json({ message: "Giriş yapmalısınız" });
    }

    const newPost = new Post({
      gameId,
      gameName,
      postText,
      postTitle,
      userId: user.id,
    });
    await newPost.save();
    return res.status(200).json({
      message: "işlem başarıyla gerçekleşti",
    });
  } catch (error) {
    return res.status(500).json({ message: "Sunucu Hatası", error });
  }
};

const getPostList = async (req, res) => {
  try {
    const getAllPost = await Post.findAll({
      order: [["createdAt", "DESC"]], // createdAt'e göre azalan sıralama
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userName"],
        },
      ],
    });

    return res.json(getAllPost.map((p) => p.toJSON()));
  } catch (error) {
    return res.status(500).json({
      message: "Form bilgileri çekilemedi",
      error: error.message,
    });
  }
};

const getPostDetails = async (req, res) => {
  const { postId } = req.params;
  const { offset = 0 } = req.query;
  const limit = 10;
  const userId = req.user?.id || null; // Kullanıcı yoksa null ata

  try {
    const totalReplies = await replyPost.count({
      where: { postId },
    });

    const totalPages = Math.ceil(totalReplies / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    let isSaved = false;

    if (userId) {
      const savedPost = await SavedPost.findOne({ where: { postId, userId } });
      isSaved = !!savedPost;
    }

    const getPost = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: replyPost,
          as: "replies",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["userName"],
            },
          ],
          limit: limit,
          offset: parseInt(offset, 10) || 0,
        },
        {
          model: User,
          as: "user",
          attributes: ["userName"],
        },
      ],
    });

    if (!getPost) {
      return res.status(404).json({ message: "Gönderi bulunamadı" });
    }

    const isLastPage = currentPage === totalPages;

    return res.status(200).json({
      postDetails: [{ ...getPost.get({ plain: true }), isSaved }],
      pagination: {
        currentPage,
        totalPages,
        isLastPage,
        totalReplies,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getGamePostList = async (req, res) => {
  try {
    const gameId = parseInt(req.query.gameId, 10);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: "Geçersiz gameId" });
    }
    const getGamePosts = await Post.findAll({ where: { gameId: gameId } });
    if (!getGamePosts) {
      return res.json("post yok");
    }
    return res.json(
      getGamePosts.length ? getGamePosts.map((gp) => gp.toJSON()) : []
    );
  } catch (error) {
    console.error("Hata:", error.message);
    return res.status(500).json({
      message: "Form bilgileri çekilemedi",
      error: error.stack,
    });
  }
};

const getFavoriGamesPostList = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ message: "Giriş yapıp favori oyunlarınızı seçin" });
    }

    const getFavoritedGames = await FavoritedGames.findAll({
      where: { userId: user.id },
      attributes: ["gameId"],
    });

    if (!getFavoritedGames.length) {
      return res.json([]);
    }

    const favoritedGameIds = getFavoritedGames.map((game) => game.gameId);

    const getFavoritedGamesPost = await Post.findAll({
      where: {
        gameId: { [Op.in]: favoritedGameIds },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userName"],
        },
      ],
    });

    return res.json(getFavoritedGamesPost);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(500).json({ message: "Kullanıcı bulunamadı" });
    }
    const getUserPosts = await Post.findAll({
      where: { userId: userId },
      attributes: ["gameName", "gameId", "postTitle", "postText", "userId"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userName"],
        },
      ],
    });
    return res.status(200).json(getUserPosts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyPosts = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!userId) {
      return res.status(500).json({ message: "Kullanıcı bulunamadı" });
    }
    const getUserPosts = await Post.findAll({
      where: { userId: userId },
      attributes: [
        "gameName",
        "gameId",
        "postTitle",
        "postText",
        "userId",
        "id",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userName"],
        },
      ],
    });
    return res.status(200).json(getUserPosts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  const { postId } = req.params;
  try {
    if (!postId) {
      return res.status(400).json({ message: "Post ID sağlanmadı" });
    }
    await Post.destroy({
      where: { id: postId },
    });
    return res.status(200).json({ message: "Post silindi" });
  } catch (error) {}
};

const addSavePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    const userPost = await Post.findOne({ where: { id: postId } });

    if (!userPost) {
      return res.status(404).send("Gönderi bulunamadı");
    }

    if (userPost.userId === userId) {
      return res.status(409).send("Bu gönderi size ait, kaydedemezsiniz.");
    }

    const existingSavedPost = await SavedPost.findOne({
      where: { postId, userId },
    });

    if (existingSavedPost) {
      await existingSavedPost.destroy();
      return res.status(200).json({ message: "Gönderi kaydı silindi" });
    } else {
      await SavedPost.create({ postId, userId });

      return res.status(200).json({
        message: "Gönderi başarıyla kaydedildi",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Sunucu hatası");
  }
};

const getSavedPost = async (req, res) => {
  const userId = req.user.id;
  try {
    const savedPosts = await SavedPost.findAll({
      where: { userId },
      include: [
        {
          model: Post,
          as: "savedPost",
          attributes: ["gameName", "gameId", "postTitle", "postText", "userId"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["userName"],
              required: false,
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    if (!savedPosts.length) {
      return res.status(404).json({ message: "Kaydedilmiş gönderi yok" });
    }
    return res.status(200).json(savedPosts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const user = req.user;
    const { postId, reply } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Önce giriş yapmalısınız" });
    }
    if (!postId) {
      return res
        .status(400)
        .json({ message: "Yorum yapılmak istenilen forum bulunamadı" });
    }
    if (!reply) {
      return res.status(400).json({ message: "Yorum alanı boş olamaz" });
    }

    const newReply = new replyPost({
      postId,
      userId: user.id,
      reply,
    });

    await newReply.save();

    return res.status(201).json({
      message: "İşlem başarıyla gerçekleşti",
    });
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({ message: "Sunucu hatası, tekrar deneyin." });
  }
};

const addFeaturePosts = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.body;

  if (!postId) return res.status(404).send({ message: "Post ID sağlanmadı!" });

  try {
    const existingFeature = await UserPostFeatured.findOne({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (existingFeature) {
      await UserPostFeatured.destroy({
        where: {
          userId: userId,
          postId: postId,
        },
      });
      return res
        .status(200)
        .send({ message: "Öne çıkarılanlardan kaldırıldı" });
    } else {
      await UserPostFeatured.create({ userId, postId });

      return res.status(200).send({ message: "Post öne çıkarıldı!" });
    }
  } catch (error) {
    console.error("Sunucu hatası:", error);
    res.status(500).send({ message: "Sunucu hatası!", error });
  }
};

const getFeaturePosts = async (req, res) => {
  try {
    const featuredPosts = await UserPostFeatured.findAll({
      attributes: [
        "postId",
        [Sequelize.fn("COUNT", Sequelize.col("postId")), "postCount"],
      ],
      group: ["postId"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("postId")), "DESC"]],
    });

    const postDetails = await Promise.all(
      featuredPosts.map(async (featuredPost) => {
        const postId = featuredPost.postId;
        const post = await Post.findOne({
          where: { id: postId },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["userName"],
            },
          ],
        });

        return {
          postId,
          postCount: featuredPost.dataValues.postCount,
          postDetails: post,
        };
      })
    );

    return res.status(200).json(postDetails);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.posts = {
  addPost,
  getPostList,
  getPostDetails,
  getGamePostList,
  getUserPosts,
  getMyPosts,
  deletePost,
  addSavePost,
  getSavedPost,
  addComment,
  addFeaturePosts,
  getFeaturePosts,
  getFavoriGamesPostList,
};
module.exports = {
  addPost,
  getPostList,
  getPostDetails,
  getGamePostList,
  getUserPosts,
  getMyPosts,
  deletePost,
  addSavePost,
  getSavedPost,
  addComment,
  addFeaturePosts,
  getFeaturePosts,
  getFavoriGamesPostList,
};
