const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  addTenant,
  fetchAllTenant,
  getSingleTenant,
  inActiveTenant,
} = require("../controller/Tenant");

const tenantRoute = express.Router();

tenantRoute.post("/add-tenant", verifyAdmin, addTenant);
tenantRoute.get("/single-tenant/:tenantId", verifyAdmin, getSingleTenant);
tenantRoute.get("/all-tenant", verifyAdmin, fetchAllTenant);
//all inActive Tenants
tenantRoute.get("/all-tenant/inactive", verifyAdmin, inActiveTenant);

module.exports = { tenantRoute };
