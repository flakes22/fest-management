const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");

const router = express.Router();

// Update participant profile (editable fields)
router.put("/me", auth, async (req, res) => {
  try {
    const updates = {};
    const allowed = ["firstName", "lastName", "contactNumber", "college", "interests"];
    allowed.forEach((k) => { if (k in req.body) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select("-password");
    res.json({ user });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

// Follow/unfollow organizer
router.post("/follow/:organizerId", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId);
    const id = req.params.organizerId;
    if (!me.followedOrganizers.some((o) => String(o) === id)) {
      me.followedOrganizers.push(id);
      await me.save();
    }
    res.json({ message: "Followed" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

router.delete("/follow/:organizerId", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId);
    me.followedOrganizers = me.followedOrganizers.filter((o) => String(o) !== req.params.organizerId);
    await me.save();
    res.json({ message: "Unfollowed" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

module.exports = router;