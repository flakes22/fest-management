const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Create organizer (admin only)
router.post("/organizers", auth, requireRole("admin"), async (req, res) => {
  try {
    const { organizerName, organizerCategory, organizerDescription, organizerContactEmail, loginEmail, password } = req.body;
    if (!loginEmail || !password || !organizerName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await User.findOne({ email: loginEmail });
    if (existing) return res.status(409).json({ message: "Login email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const organizer = await User.create({
      firstName: organizerName,
      lastName: "Org", // ensure non-empty
      email: loginEmail,
      password: hash,
      role: "organizer",
      organizerName,
      organizerCategory,
      organizerDescription,
      organizerContactEmail
    });
    res.status(201).json({ message: "Organizer created", organizerId: organizer._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove/disable organizer
router.delete("/organizers/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "organizer") return res.status(404).json({ message: "Organizer not found" });
    await user.deleteOne();
    res.json({ message: "Organizer removed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;