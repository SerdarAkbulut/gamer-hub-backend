const { User } = require("../models/userModel");
const Follow = require("../models/follow");

const addFollow = async (req, res) => {
  const user = req.user;
  const { followingId } = req.body;
  if (user.id === followingId) {
    return res
      .staus(400)
      .send({ message: "Kendi kendinizi takip edemezsiniz" });
  }
  try {
    const following = await User.findByPk(followingId);
    if (!following) {
      return res
        .status(404)
        .send("Takip edilmek istenen kullanıcı bulunamadı.");
    }
    const existingFollow = await Follow.findOne({
      where: { followerId: user.id, followingId },
    });
    if (existingFollow) {
      await existingFollow.destroy();
      return res.status(200).send("Kullanıcı takipten çıkarıldı");
    } else {
      await Follow.create({ followerId: user.id, followingId });
      return res.status(200).send("Kullanıcı başarıyla takip edildi.");
    }
  } catch (error) {
    return res.status(500).send("Sunucu hatası: " + error.message);
  }
};

const unFollow = async (req, res) => {
  const user = req.user;
  const { followingId } = req.body;

  try {
    const followRecord = await Follow.findOne({
      where: { followerId: user.id, followingId },
    });
    if (!followRecord) {
      return res.status(404).send("Takip kaydı bulunamadı.");
    }
    await followRecord.destroy();
    return res.status(200).send("Takipten çıkıldı.");
  } catch (error) {
    return res.status(500).send("Sunucu hatası: " + error.message);
  }
};

const getUserFollower = async (req, res) => {
  const { id } = req.params;
  try {
    const following = await Follow.findAll({
      where: { followerId: id },
      include: [{ model: User, as: "Following" }],
    });

    return res.status(200).json(following);
  } catch (error) {
    return res.status(500).send("Sunucu hatası: " + error.message);
  }
};
const getUserFollowing = async (req, res) => {
  const { id } = req.params;
  try {
    const followers = await Follow.findAll({
      where: { followingId: id },
      include: [{ model: User, as: "Followers" }],
    });

    return res.status(200).json(followers);
  } catch (error) {
    return res.status(500).send("Sunucu hatası: " + error.message);
  }
};

exports.Follow = {
  addFollow,
  getUserFollower,
  getUserFollowing,
  unFollow,
};
module.exports = {
  addFollow,
  getUserFollower,
  getUserFollowing,
  unFollow,
};
