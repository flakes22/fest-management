const express = require("express");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/eventController");

const router = express.Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

router.post("/", auth, requireRole("organizer", "admin"), ctrl.create);
router.put("/:id", auth, requireRole("organizer", "admin"), ctrl.update);

module.exports = router;