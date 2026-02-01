const mongoose = require("mongoose");
const allocateUnitSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminSignup",
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "units",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tenant",
      required: true,
    },
    rentAmount: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    //Billing Date
    billingDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    startDate: {
      type: Date,
      default: Date.now, // tenant move-in date
    },
    endDate: {
      type: Date,
      default: null,
    },
    lastRentGeneratedMonth: {
      type: String,
      default: null,
    }, // "2026-01"
  },
  { timestamps: true },
);

module.exports = mongoose.model("UnitAllocation", allocateUnitSchema);
