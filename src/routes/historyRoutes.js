const express = require("express");
const router = express.Router();
const {
  getUserHistory,
  getOrderHistory,
  getAllHistory,
} = require("../controllers/historyController");
const auth = require("../middleware/auth");
const roles = require("../middleware/Roles");

router.get("/", auth, roles("admin"), getAllHistory);
router.get("/user/:userId", auth, getUserHistory);
router.get("/order/:orderId", auth, getOrderHistory);

module.exports = router;
