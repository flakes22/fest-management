const express = require("express");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const User = require("../models/user");

const router = express.Router();

// GET my organizer profile (organizer/admin)
router.get("/me", auth, requireRole("organizer", "admin"), async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select("-password");
    if (!me) return res.status(404).json({ message: "User not found" });
    const organizer = {
      organizerName: me.organizerName || me.firstName || "",
      organizerCategory: me.organizerCategory || "",
      organizerDescription: me.organizerDescription || "",
      contactEmail: me.organizerContactEmail || me.email || "",
      contactNumber: me.contactNumber || "",
      discordWebhookUrl: me.discordWebhookUrl || "",
      photoUrl: me.photoUrl || ""
    };
    res.json({ organizer });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

// PUT my organizer profile (editable fields)
router.put("/me", auth, requireRole("organizer", "admin"), async (req, res) => {
  try {
    const allowed = ["organizerName", "organizerCategory", "organizerDescription", "organizerContactEmail", "contactNumber", "discordWebhookUrl", "photoUrl"];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select("-password");
    res.json({ organizer: {
      organizerName: user.organizerName || "",
      organizerCategory: user.organizerCategory || "",
      organizerDescription: user.organizerDescription || "",
      contactEmail: user.organizerContactEmail || user.email || "",
      contactNumber: user.contactNumber || "",
      discordWebhookUrl: user.discordWebhookUrl || "",
      photoUrl: user.photoUrl || ""
    }});
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

module.exports = router;