const express = require("express");
const router = express.Router();
const {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  approveShop,
} = require("../controllers/shopController");
const { validateShop } = require("../middleware/validation");
const auth = require("../middleware/auth");
const roles = require("../middleware/Roles");

router.get("/", getAllShops);
router.get("/:id", getShopById);
router.post("/", auth, roles("vendor", "admin"), validateShop, createShop);
router.put("/:id", auth, roles("vendor", "admin"), updateShop);
router.delete("/:id", auth, roles("admin"), deleteShop);
//router.put("/:id/approve", auth, roles("admin"), approveShop);

module.exports = router;
