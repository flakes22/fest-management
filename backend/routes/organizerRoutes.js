const express = require("express");
const User = require("../models/user");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

// List all organizers (public). If user logged in, mark isFollowed.
router.get("/", optionalAuth, async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" })
      .select("_id organizerName organizerCategory organizerDescription organizerContactEmail");
    if (!req.user) return res.json({ organizers });

    const me = await User.findById(req.user.userId).select("followedOrganizers");
    const followedSet = new Set((me?.followedOrganizers || []).map((id) => String(id)));
    const withFlag = organizers.map((o) => ({
      ...o.toObject(),
      isFollowed: followedSet.has(String(o._id))
    }));
    res.json({ organizers: withFlag });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;