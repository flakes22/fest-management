const dotenv = require("dotenv"); dotenv.config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Event = require("../models/event");
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const orgEmail = "org@felicity.local";
  let org = await User.findOne({ email: orgEmail });
  if (!org) {
    org = await User.create({
      firstName: "Felicity", lastName: "Org", email: orgEmail,
      password: await bcrypt.hash("OrgPass123!", 10), role: "organizer",
      organizerName: "Felicity Club"
    });
  }
  const now = new Date();
  const e1 = await Event.create({
    name: "Sample Normal", type: "normal", registrationDeadline: new Date(now.getFullYear() + 1, 1, 1),
    startDate: new Date(now.getFullYear(), 5, 1), endDate: new Date(now.getFullYear(), 5, 2),
    registrationLimit: 100, organizer: org._id, status: "published", tags: ["robotics"]
  });
  console.log("Seeded:", orgEmail, e1._id.toString());
  await mongoose.disconnect(); process.exit(0);
})();