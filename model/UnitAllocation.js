const mongoose = require("mongoose");
const UnitAllocationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tenant",
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "units",
    },
    startDate: {
      type: Date,
      default: Date.now, // tenant move-in date
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UnitAllocation", UnitAllocationSchema);
