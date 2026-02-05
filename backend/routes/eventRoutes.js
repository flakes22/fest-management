const express = require("express");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const ctrl = require("../controllers/eventController");

const router = express.Router();

// List/detail with optional personalization
router.get("/", optionalAuth, ctrl.list);
router.get("/:id", optionalAuth, ctrl.get);

// Organizer/admin mutations
router.post("/", auth, requireRole("organizer", "admin"), ctrl.create);
router.put("/:id", auth, requireRole("organizer", "admin"), ctrl.update);

// Status transition endpoints
router.post("/:id/publish", auth, requireRole("organizer", "admin"), ctrl.publish);
router.post("/:id/close", auth, requireRole("organizer", "admin"), ctrl.close);
router.post("/:id/ongoing", auth, requireRole("organizer", "admin"), ctrl.setOngoing);
router.post("/:id/completed", auth, requireRole("organizer", "admin"), ctrl.setCompleted);

// Extend deadline/limit
router.post("/:id/extend", auth, requireRole("organizer", "admin"), ctrl.extend);

module.exports = router;