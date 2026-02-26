const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews,
} = require("../controllers/reviewController");
const { validateReview } = require("../middleware/validation");
const auth = require("../middleware/auth");
const roles = require("../middleware/Roles");

router.post("/", auth, roles("client"), validateReview, createReview);
router.get("/product/:productId", getProductReviews);
router.get("/user/me", auth, roles("client"), getUserReviews);
router.put("/:id", auth, roles("client"), updateReview);
router.delete("/:id", auth, roles("client", "admin"), deleteReview);

module.exports = router;
