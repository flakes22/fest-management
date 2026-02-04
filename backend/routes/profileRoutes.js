const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");
const { Types } = require("mongoose");

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
    if (req.user.role !== "participant") return res.status(403).json({ message: "Forbidden" });
    const id = req.params.organizerId;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid organizerId" });

    const org = await User.findOne({ _id: id, role: "organizer" }).select("_id");
    if (!org) return res.status(404).json({ message: "Organizer not found" });

    const me = await User.findById(req.user.userId);
    if (!me.followedOrganizers.some((o) => String(o) === id)) {
      me.followedOrganizers.push(org._id);
      await me.save();
    }
    res.json({ message: "Followed" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

router.delete("/follow/:organizerId", auth, async (req, res) => {
  try {
    if (req.user.role !== "participant") return res.status(403).json({ message: "Forbidden" });
    const id = req.params.organizerId;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid organizerId" });

    const me = await User.findById(req.user.userId);
    me.followedOrganizers = me.followedOrganizers.filter((o) => String(o) !== id);
    await me.save();
    res.json({ message: "Unfollowed" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

// Get preferences (interests + followedOrganizers)
router.get("/preferences", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId)
      .select("interests followedOrganizers")
      .populate("followedOrganizers", "_id organizerName organizerCategory");
    res.json({
      interests: me?.interests || [],
      followedOrganizers: (me?.followedOrganizers || []).map((o) => o)
    });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

// Update preferences in one call (optional arrays)
router.put("/preferences", auth, async (req, res) => {
  try {
    const { interests, followedOrganizers } = req.body;
    const updates = {};
    if (Array.isArray(interests)) updates.interests = interests;

    if (Array.isArray(followedOrganizers)) {
      const clean = [...new Set(followedOrganizers.map(String))].filter((id) => Types.ObjectId.isValid(id));
      if (clean.length !== followedOrganizers.length) {
        return res.status(400).json({ message: "Invalid organizer IDs in followedOrganizers" });
      }
      updates.followedOrganizers = clean;
    }

    const me = await User.findByIdAndUpdate(req.user.userId, updates, { new: true })
      .select("interests followedOrganizers");
    res.json({ interests: me.interests || [], followedOrganizers: me.followedOrganizers || [] });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
});

module.exports = router;