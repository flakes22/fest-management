const express = require("express");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/registrationController");

const router = express.Router();

router.post("/normal/:eventId", auth, requireRole("participant", "organizer", "admin"), ctrl.registerNormal);
router.post("/merch/:eventId", auth, requireRole("participant", "organizer", "admin"), ctrl.purchaseMerch);
router.get("/me", auth, ctrl.myHistory);

module.exports = router;