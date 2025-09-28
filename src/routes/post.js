const { Router } = require("express");
const auth = require("../middleware/auth");
const {
  addPost,
  deletePost,
  getPostList,
  getPostDetails,
  getFavoriGamesPostList,
  getUserPosts,
  getMyPosts,
  addSavePost,
  getSavedPost,
  addComment,
  addFeaturePosts,
  getFeaturePosts,
} = require("../controllers/postController");
const optionalAuth = require("../middleware/optionalAuth ");

const router = Router();

router.post("/addPost", auth, addPost);
router.delete("/deletePost/:postId", auth, deletePost);
router.post("/addSavePost", auth, addSavePost);
router.post("/comment", auth, addComment);
router.post("/featurePost", auth, addFeaturePosts);
router.get("/postList", getPostList);
router.get("/postDetails/:postId", optionalAuth, getPostDetails);
router.get("/favoriGame/postList", auth, getFavoriGamesPostList);
router.get("/userPosts/:userId", getUserPosts);
router.get("/myPosts", getMyPosts);
router.get("/savedPost", getSavedPost);
router.get("/featurePosts", getFeaturePosts);

module.exports = router;
