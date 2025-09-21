const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class SavedPost extends Model {}

SavedPost.init(
  {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
  }
);

module.exports = SavedPost;
