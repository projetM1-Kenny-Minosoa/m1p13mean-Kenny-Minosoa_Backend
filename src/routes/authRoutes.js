const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { validateUser } = require("../middleware/validation");
const auth = require("../middleware/auth");

router.post("/register", validateUser, register);
router.post("/login", login);
router.get("/me", auth, getMe);

module.exports = router;