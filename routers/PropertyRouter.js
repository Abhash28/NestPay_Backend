const express = require("express");
const {
  addProperty,
  fetchAllProperty,
  allUnit,
  unitAllocation,
  getSingleProperty,
} = require("../controller/Property");
const { verifyAdmin } = require("../utils/verifyAdmin");

const propertyRouter = express.Router();

propertyRouter.post("/add-property", verifyAdmin, addProperty);
propertyRouter.get(
  "/single-property/:propertyId",
  verifyAdmin,
  getSingleProperty
);

propertyRouter.get("/all-property", verifyAdmin, fetchAllProperty);
propertyRouter.get("/all-units/:propertyId", verifyAdmin, allUnit);
propertyRouter.post(
  "/all-units/:propertyId/allocation",
  verifyAdmin,
  unitAllocation
);

module.exports = { propertyRouter };
