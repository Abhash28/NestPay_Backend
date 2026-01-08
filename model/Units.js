const mongoose = require("mongoose");
const unitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },
    unitNumber: {
      type: Number,
      required: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["vacant", "occupied"],
      default: "vacant",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenants",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("units", unitSchema);
