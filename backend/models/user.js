const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["participant", "organizer", "admin"], required: true },

    // Participant-only
    participantType: { type: String, enum: ["IIIT", "Non-IIIT"], default: "Non-IIIT" },
    college: { type: String },
    contactNumber: { type: String },

    // Organizer-only details (kept on user for simplicity)
    organizerName: { type: String },
    organizerCategory: { type: String },
    organizerDescription: { type: String },
    organizerContactEmail: { type: String },

    // Preferences
    interests: [{ type: String }],
    followedOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
