const mongoose = require("mongoose");
const TenantSchema = new mongoose.Schema({
  tenantName: {
    type: String,
    required: true,
  },
  tenantMobileNo: {
    type: Number,
    required: true,
  },
  tenantAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "adminSignup",
    required: true,
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "units",
    default: null,
  },
});
module.exports = mongoose.model("tenant", TenantSchema);
