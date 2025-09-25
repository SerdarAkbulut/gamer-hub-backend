const { Router } = require("express");
const auth = require("../middleware/auth");
const {
  addFollow,
  unFollow,
  getUserFollower,
  getUserFollowing,
} = require("../controllers/followController");

const router = Router();
router.post("/addFollow", auth, addFollow);
router.post("/unFollow", auth, unFollow);
router.get("/userFollower/:id", getUserFollower);
router.get("/userFollowing/:id", getUserFollowing);
module.exports = router;
