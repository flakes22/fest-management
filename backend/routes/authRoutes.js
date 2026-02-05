const express = require("express");
const router = express.Router();

const { register, login, changePassword } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Participants only: change own password
router.post("/change-password", auth, changePassword);

module.exports = router;