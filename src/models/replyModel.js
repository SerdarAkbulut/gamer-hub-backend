const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class replyPost extends Model {}

replyPost.init(
  {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reply: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, modelName: "replyPost" }
);

module.exports = replyPost;
