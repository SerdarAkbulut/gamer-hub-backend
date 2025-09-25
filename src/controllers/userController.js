const Joi = require("joi");
const { User, Follow } = require("../models");
const { Op } = require("sequelize");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const FormData = require("form-data");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateResetToken = (userId) => {
  const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return resetToken;
};
const generateResetLink = (token) => {
  return `http://localhost:3002/reset-password?token=${token}`; // Frontend URL'inizi burada kullanın
};
const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return { error: "Bu bağlantının süresi dolmuş. Lütfen tekrar deneyin." };
    }
    return { error: "Geçersiz veya bozuk token." };
  }
};

function validateRegister(user) {
  const schema = Joi.object({
    userName: Joi.string().min(3).max(50).required().messages({
      "string.min": "Kullanıcı adı en az 3 karakter uzunluğunda olmalıdır",
      "string.max": "Kullanıcı adı en fazla 50 karakter uzunluğunda olmalıdır",
      "any.required": "Kullanıcı adı gereklidir",
    }),

    email: Joi.string().min(3).max(50).required().email().messages({
      "string.min": "E-posta en az 3 karakter uzunluğunda olmalıdır",
      "string.max": "E-posta en fazla 50 karakter uzunluğunda olmalıdır",
      "string.email": "Geçerli bir e-posta adresi girin",
      "any.required": "E-posta gereklidir",
    }),

    password: Joi.string().min(5).required().messages({
      "string.min": "Şifre en az 5 karakter uzunluğunda olmalıdır",
      "any.required": "Şifre gereklidir",
    }),
  });

  return schema.validate(user);
}

function validateUpdateUser(user) {
  const schema = Joi.object({
    userName: Joi.string().min(3).max(50).optional().empty("").messages({
      "string.min": "Kullanıcı adı en az 3 karakter uzunluğunda olmalıdır",
      "string.max": "Kullanıcı adı en fazla 50 karakter uzunluğunda olmalıdır",
    }),

    email: Joi.string().min(3).max(50).email().optional().empty("").messages({
      "string.min": "E-posta en az 3 karakter uzunluğunda olmalıdır",
      "string.max": "E-posta en fazla 50 karakter uzunluğunda olmalıdır",
      "string.email": "Geçerli bir e-posta adresi girin",
    }),

    currentPassword: Joi.string()
      .required()
      .empty("")
      .when("password", {
        is: Joi.exist(),
        then: Joi.required(),
      })
      .messages({
        "any.required": "İşlem yapmak için şifrenizi girin",
      }),

    password: Joi.string().min(5).optional().empty("").messages({
      "string.min": "Yeni şifre en az 5 karakter uzunluğunda olmalıdır",
    }),
  });

  return schema.validate(user);
}

const register = async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let user = await User.findOne({
    where: {
      [Op.or]: [{ email: req.body.email }, { userName: req.body.userName }],
    },
  });
  if (user) {
    return res.status(409).send({
      error: "conflict",
      message: "E-posta veya kullanıcı adı zaten kayıtlı",
    });
  }

  user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();
  return res.status(200).send("Kayıt İşlemi Başarılı");
};

const getUserDetails = async (req, res) => {
  const { id } = req.params;
  const loggedInUserId = req.user ? req.user.id : null;

  let user = await User.findOne({
    where: {
      id: id,
    },
    attributes: ["userName", "id", "banner"],
  });

  if (!user) {
    return res.status(404).send("Kullanıcı Bulunamadı");
  }

  let isFollowing = false;
  if (loggedInUserId) {
    const follow = await Follow.findOne({
      where: {
        followerId: loggedInUserId,
        followingId: id,
      },
    });
    isFollowing = follow ? true : false;
  }

  return res.status(200).json({
    user,
    isFollowing,
  });
};
const login = async (req, res) => {
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(409).send("Böyle bir email kaydı bulunamadı");
    }

    const isSuccess = await bcrypt.compare(req.body.password, user.password);
    if (!isSuccess) {
      return res.status(409).send("Şifre hatalı");
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "30d",
    });

    return res.header("Authorization", token).json({ token });
  } catch (error) {
    return res.status(500).send("Sunucu hatası: " + error.message);
  }
};
const updateUser = async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = await User.findOne({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(404).send("Kullanıcı bulunamadı");
  }

  if (req.body.password && req.body.password.trim() !== "") {
    if (!req.body.currentPassword) {
      return res
        .status(400)
        .send("Şifre değiştirmek için mevcut şifreyi girin");
    }

    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!isMatch) {
      return res.status(400).send("Mevcut şifre hatalı");
    }

    user.password = await bcrypt.hash(req.body.password, 10);
  }

  user.userName = req.body.userName || user.userName;
  user.email = req.body.email || user.email;

  try {
    await user.save();
    res.status(200).send("Kullanıcı başarıyla güncellendi");
  } catch (err) {
    console.error(err);
    res.status(500).send("Sunucu hatası");
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  let user = await User.findOne({ where: { email: email } });

  if (!user) {
    return res.status(404).send({ message: "Girilen email kaydı bulunamadı" });
  }

  try {
    const resetToken = generateResetToken(user.id);

    const resetLink = generateResetLink(resetToken);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAILJS_USER,
        pass: process.env.EMAILJS_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAILJS_USER,
      to: email,
      subject: "Şifre Sıfırlama",
      text: `Şifrenizi sıfırlamak için şu bağlantıya tıklayın: ${resetLink}`,
      html: `<b>Şifrenizi sıfırlamak için şu bağlantıya tıklayın:</b> <a href="${resetLink}">${resetLink}</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .send({ message: "E-posta gönderilirken bir hata oluştu." });
      }

      return res
        .status(200)
        .send({ message: "Şifre sıfırlama linki mail adresinize gönderildi" });
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "E-posta gönderilirken bir hata oluştu." });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const decoded = verifyResetToken(token);

  if (decoded.error) {
    return res.status(400).json({ message: decoded.error });
  }

  const user = await User.findOne({ where: { id: decoded.userId } });

  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Şifreniz başarıyla güncellendi!" });
};

const checkResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(400).json({
      valid: false,
      message:
        "Bağlantı linkinin süresi dolmuş yeniden bağlantı linki isteyin   ",
    });
  }
};
const uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Lütfen bir resim yükleyin" });
    }

    const base64Data = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "user_banners",
    });

    const fileUrl = result.secure_url;

    await User.update({ banner: fileUrl }, { where: { id: req.user.id } });

    return res.status(200).json({ imageUrl: fileUrl });
  } catch (error) {
    console.error(
      "Cloudinary yükleme hatası:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ message: "Resim yükleme başarısız", error: error.message });
  }
};
module.exports = {
  register,
  getUserDetails,
  login,
  updateUser,
  forgotPassword,
  resetPassword,
  checkResetPasswordToken,
  uploadBanner,
};
