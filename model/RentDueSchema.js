const mongoose = require("mongoose");

const RentDueSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminSignup",
      required: true,
    },
    allocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnitAllocation",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "units",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tenant",
      required: true,
    },
    month: {
      type: String,
      required: true, // "2026-01"
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paidAt: Date,
  },
  { timestamps: true },
);

//Add index AFTER schema definition
RentDueSchema.index({ allocationId: 1, month: 1 }, { unique: true });
// SAFE EXPORT (prevents overwrite error)
module.exports =
  mongoose.models.RentDue || mongoose.model("RentDue", RentDueSchema);
