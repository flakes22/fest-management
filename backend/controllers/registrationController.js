const Event = require("../models/event");
const Registration = require("../models/registration");
const crypto = require("crypto");

function genTicket() { return "TKT-" + crypto.randomBytes(6).toString("hex").toUpperCase(); }

exports.registerNormal = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || event.type !== "normal") return res.status(404).json({ message: "Event not found" });
    if (new Date() > new Date(event.registrationDeadline)) return res.status(400).json({ message: "Deadline passed" });
    if (!["published", "ongoing"].includes(event.status)) return res.status(400).json({ message: "Registrations not open" });

    const count = await Registration.countDocuments({ event: event._id, type: "normal", status: "registered" });
    if (count >= event.registrationLimit) return res.status(409).json({ message: "Registration limit reached" });

    // Optional: validate formData against event.formFields
    const formData = req.body.formData || {};

    const reg = await Registration.create({
      event: event._id,
      user: req.user.userId,
      type: "normal",
      status: "registered",
      ticketId: genTicket(),
      formData,
      feePaid: event.registrationFee || 0
    });

    // Lock form after first registration
    if (!event.formLocked) { event.formLocked = true; await event.save(); }

    res.status(201).json({ message: "Registered", ticketId: reg.ticketId });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.purchaseMerch = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || event.type !== "merchandise") return res.status(404).json({ message: "Event not found" });
    if (!["published", "ongoing"].includes(event.status)) return res.status(400).json({ message: "Sales not open" });

    const { itemIndex = 0, quantity = 1 } = req.body;
    const item = event.merch?.items?.[itemIndex];
    if (!item) return res.status(400).json({ message: "Invalid item" });
    if (item.stock < quantity) return res.status(409).json({ message: "Out of stock" });
    if (quantity > (item.purchaseLimitPerParticipant || 1)) return res.status(400).json({ message: "Exceeds purchase limit" });

    item.stock -= quantity;
    await event.save();

    const reg = await Registration.create({
      event: event._id,
      user: req.user.userId,
      type: "merchandise",
      status: "registered",
      ticketId: genTicket(),
      merchItem: { name: item.name, size: item.size, color: item.color, variant: item.variant, quantity },
      feePaid: event.registrationFee || 0
    });

    res.status(201).json({ message: "Purchased", ticketId: reg.ticketId });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.myHistory = async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user.userId }).populate("event", "name type organizer startDate endDate");
    res.json({ history: regs });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};