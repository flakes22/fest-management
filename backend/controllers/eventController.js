const Event = require("../models/event");

exports.create = async (req, res) => {
  try {
    const {
      name, description, type, eligibility, registrationDeadline,
      startDate, endDate, registrationLimit, registrationFee, tags
    } = req.body;

    if (!name || !type || !registrationDeadline || !startDate || !endDate || !registrationLimit) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    const event = await Event.create({
      name, description, type, eligibility,
      registrationDeadline, startDate, endDate,
      registrationLimit, registrationFee,
      organizer: req.user.userId,
      tags: Array.isArray(tags) ? tags : [],
      status: "draft"
    });
    res.status(201).json({ message: "Event created (draft)", eventId: event._id });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.update = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (String(event.organizer) !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Enforce editing rules by status
    const allowedFieldsByStatus = {
      draft: ["name", "description", "type", "eligibility", "registrationDeadline", "startDate", "endDate", "registrationLimit", "registrationFee", "tags", "formFields", "merch", "status"],
      published: ["description", "registrationDeadline", "registrationLimit", "status"],
      ongoing: ["status"],
      closed: ["status"],
      completed: ["status"]
    };
    const allowed = allowedFieldsByStatus[event.status] || [];
    const updates = {};
    Object.keys(req.body).forEach((k) => { if (allowed.includes(k)) updates[k] = req.body[k]; });

    if (updates.startDate && updates.endDate && new Date(updates.startDate) >= new Date(updates.endDate)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }
    if (event.status !== "draft" && updates.formFields) {
      return res.status(400).json({ message: "Form fields locked after first registration/publish" });
    }

    Object.assign(event, updates);
    await event.save();
    res.json({ message: "Event updated", status: event.status });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.get = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "firstName organizerName email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ event });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.list = async (req, res) => {
  try {
    const q = {};
    if (req.query.type) q.type = req.query.type;
    if (req.query.organizer) q.organizer = req.query.organizer;
    const events = await Event.find(q).sort({ startDate: 1 });
    res.json({ events });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};