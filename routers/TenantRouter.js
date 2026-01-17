const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  addTenant,
  fetchAllTenant,
  getSingleTenant,
  inActiveTenant,
  updateTenant,
} = require("../controller/Tenant");

const tenantRoute = express.Router();

tenantRoute.post("/add-tenant", verifyAdmin, addTenant);
tenantRoute.put("/update-tenant", verifyAdmin, updateTenant);
tenantRoute.get("/single-tenant/:tenantId", verifyAdmin, getSingleTenant);
tenantRoute.get("/all-tenant", verifyAdmin, fetchAllTenant);
//all inActive Tenants
tenantRoute.get("/all-tenant/inactive", verifyAdmin, inActiveTenant);

module.exports = { tenantRoute };
