const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  getShopOrders,
  cancelOrder,
} = require("../controllers/orderController");
const { validateOrder } = require("../middleware/validation");
const auth = require("../middleware/auth");
const roles = require("../middleware/Roles");

router.post("/", auth, roles("client"), validateOrder, createOrder);
router.get("/", auth, roles("admin"), getAllOrders);
router.get("/my-orders", auth, roles("client"), getUserOrders);
router.get("/shop-orders", auth, roles("vendor"), getShopOrders);
router.get("/:id", auth, getOrderById);
router.put("/:id/status", auth, roles("vendor", "admin"), updateOrderStatus);
router.put("/:id/cancel", auth, cancelOrder);

module.exports = router;
