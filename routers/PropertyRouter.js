const express = require("express");
const {
  addProperty,
  fetchAllProperty,
  allUnit,
  unitAllocation,
  getSingleProperty,
  updateProperty,
  dashboardStats,
} = require("../controller/Property");
const { verifyAdmin } = require("../utils/verifyAdmin");

const propertyRouter = express.Router();

propertyRouter.post("/add-property", verifyAdmin, addProperty);
propertyRouter.put("/update-property", verifyAdmin, updateProperty);
propertyRouter.get(
  "/single-property/:propertyId",
  verifyAdmin,
  getSingleProperty,
);

propertyRouter.get("/all-property", verifyAdmin, fetchAllProperty);
propertyRouter.get("/all-units/:propertyId", verifyAdmin, allUnit);

// for admin dashboard stats
propertyRouter.get("/dashboard-stats", verifyAdmin, dashboardStats);
module.exports = { propertyRouter };
