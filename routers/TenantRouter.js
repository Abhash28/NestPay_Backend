const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  addTenant,
  fetchAllTenant,
  updateTenant,
  fetchTenant,
  tenantProfile,
} = require("../controller/Tenant");

const tenantRoute = express.Router();

tenantRoute.post("/add-tenant", verifyAdmin, addTenant);
tenantRoute.put("/update-tenant", verifyAdmin, updateTenant);
tenantRoute.get("/all-tenant", verifyAdmin, fetchAllTenant);

//Fetch perticular tenant for tenant dashboard
tenantRoute.get("/info", verifyAdmin, fetchTenant);
//tenant profile
tenantRoute.get("/profile", verifyAdmin, tenantProfile);

module.exports = { tenantRoute };
