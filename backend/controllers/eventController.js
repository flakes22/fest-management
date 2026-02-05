const Event = require("../models/event");
const User = require("../models/user");

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
    if (req.query.eligibility) q.eligibility = req.query.eligibility;

    // onlyPublished=true shows published+ongoing
    if (req.query.onlyPublished === "true") q.status = { $in: ["published", "ongoing"] };

    // date range filter (startDate in range OR event overlaps range)
    const { startFrom, startTo } = req.query;
    if (startFrom || startTo) {
      q.startDate = {};
      if (startFrom) q.startDate.$gte = new Date(startFrom);
      if (startTo) q.startDate.$lte = new Date(startTo);
    }

    // basic name search (regex)
    if (req.query.search) {
      q.name = { $regex: req.query.search, $options: "i" };
    }

    // If followedOnly=true and a logged-in user, filter to followed organizers’ events
    let followedSet = null;
    if (req.user && req.query.followedOnly === "true") {
      const me = await User.findById(req.user.userId).select("followedOrganizers").lean();
      followedSet = new Set((me?.followedOrganizers || []).map(String));
      q.organizer = { $in: Array.from(followedSet) };
    }

    const events = await Event.find(q).sort({ startDate: 1 }).lean();

    // Preference-based ordering if user present
    if (req.user) {
      const me = await User.findById(req.user.userId).select("interests followedOrganizers").lean();
      const interests = new Set(me?.interests || []);
      const followed = new Set((me?.followedOrganizers || []).map(String));
      const scored = events.map((e) => {
        let score = 0;
        if (followed.has(String(e.organizer))) score += 5;
        const tags = Array.isArray(e.tags) ? e.tags : [];
        for (const t of tags) if (interests.has(t)) score += 1;
        return { score, e };
      });
      scored.sort((a, b) => (b.score - a.score) || (new Date(a.e.startDate) - new Date(b.e.startDate)));
      return res.json({ events: scored.map((s) => s.e) });
    }

    res.json({ events });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

exports.publish = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (String(event.organizer) !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (event.status !== "draft") return res.status(400).json({ message: "Only draft events can be published" });
    event.status = "published";
    await event.save();
    res.json({ message: "Event published" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.close = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (String(event.organizer) !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!["published", "ongoing"].includes(event.status)) {
      return res.status(400).json({ message: "Only published/ongoing events can be closed" });
    }
    event.status = "closed";
    await event.save();
    res.json({ message: "Event closed" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.setOngoing = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (String(event.organizer) !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (event.status !== "published") return res.status(400).json({ message: "Only published events can become ongoing" });
    event.status = "ongoing";
    await event.save();
    res.json({ message: "Event marked ongoing" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.setCompleted = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (String(event.organizer) !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!["ongoing", "closed"].includes(event.status)) {
      return res.status(400).json({ message: "Only ongoing/closed events can be completed" });
    }
    event.status = "completed";
    await event.save();
    res.json({ message: "Event completed" });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};

exports.extend = async (req, res) => {
  try {
    const { registrationDeadline, registrationLimit } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (String(event.organizer) !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!["published", "ongoing"].includes(event.status)) {
      return res.status(400).json({ message: "Only published/ongoing can be extended" });
    }
    if (registrationDeadline) {
      const newDeadline = new Date(registrationDeadline);
      if (isNaN(newDeadline)) return res.status(400).json({ message: "Invalid registrationDeadline" });
      if (newDeadline < new Date()) return res.status(400).json({ message: "Deadline must be in the future" });
      event.registrationDeadline = newDeadline;
    }
    if (typeof registrationLimit === "number" && registrationLimit > event.registrationLimit) {
      event.registrationLimit = registrationLimit;
    }
    await event.save();
    res.json({ message: "Event updated", registrationDeadline: event.registrationDeadline, registrationLimit: event.registrationLimit });
  } catch (e) { console.error(e); res.status(500).json({ message: "Server error" }); }
};