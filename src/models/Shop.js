const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, required: true },
    contact: {
      phone: String,
      email: String
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    category: String,

    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Index for search
shopSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Shop", shopSchema);
