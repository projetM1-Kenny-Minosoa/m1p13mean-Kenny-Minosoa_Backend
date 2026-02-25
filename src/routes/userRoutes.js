const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const auth = require("../middleware/auth");
const roles = require("../middleware/Roles");

router.get("/", auth, roles("admin"), getAllUsers);
router.get("/:id", auth, roles("admin"), getUserById);
router.put("/:id", auth, roles("admin"), updateUser);
router.delete("/:id", auth, roles("admin"), deleteUser);

module.exports = router;