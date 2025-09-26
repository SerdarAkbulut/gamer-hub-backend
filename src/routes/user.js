const { Router } = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const FormData = require("form-data");
const {
  register,
  getUserDetails,
  login,
  forgotPassword,
  resetPassword,
  checkResetPasswordToken,
  uploadBanner,
  updateUser,
} = require("../controllers/userController");
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user/:id", getUserDetails);
router.put("/user", auth, updateUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check-reset-token/:token", checkResetPasswordToken);
router.post("/upload-banner", auth, upload.single("file"), uploadBanner);
module.exports = router;
