const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["normal", "merchandise"], required: true },
    eligibility: { type: String, default: "All" },
    registrationDeadline: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationLimit: { type: Number, required: true, min: 1 },
    registrationFee: { type: Number, default: 0 },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],

    // Merchandise-specific
    merch: {
      items: [
        {
          name: String,
          size: String,
          color: String,
          variant: String,
          stock: { type: Number, min: 0 },
          purchaseLimitPerParticipant: { type: Number, default: 1 }
        }
      ]
    },

    // Lifecycle
    status: { type: String, enum: ["draft", "published", "ongoing", "closed", "completed"], default: "draft" },

    // Registration form (normal events)
    formFields: [
      {
        label: String,
        type: { type: String, enum: ["text", "textarea", "dropdown", "checkbox", "file"] },
        required: { type: Boolean, default: false },
        options: [{ type: String }]
      }
    ],
    formLocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);