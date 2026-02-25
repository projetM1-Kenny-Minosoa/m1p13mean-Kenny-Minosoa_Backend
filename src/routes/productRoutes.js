const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByShop,
} = require("../controllers/productController");
const { validateProduct } = require("../middleware/validation");
const auth = require("../middleware/auth");
const roles = require("../middleware/Roles");

router.get("/", getAllProducts);
router.get("/shop/:shopId", getProductsByShop);
router.get("/:id", getProductById);
router.post(
  "/",
  auth,
  roles("vendor", "admin"),
  validateProduct,
  createProduct,
);
router.put("/:id", auth, roles("vendor", "admin"), updateProduct);
router.delete("/:id", auth, roles("vendor", "admin"), deleteProduct);

module.exports = router;
