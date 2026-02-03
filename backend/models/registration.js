const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["normal", "merchandise"], required: true },
    status: { type: String, enum: ["registered", "cancelled", "rejected", "completed"], default: "registered" },
    ticketId: { type: String, required: true },
    formData: {}, // responses for normal event form
    merchItem: {
      name: String, size: String, color: String, variant: String, quantity: Number
    },
    feePaid: { type: Number, default: 0 }
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, user: 1, type: 1, ticketId: 1 });

module.exports = mongoose.model("Registration", registrationSchema);