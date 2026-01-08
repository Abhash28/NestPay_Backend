const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const { addTenant, fetchAllTenant } = require("../controller/Tenant");

const tenantRoute = express.Router();

tenantRoute.post("/add-tenant", verifyAdmin, addTenant);
tenantRoute.get("/all-tenant", verifyAdmin, fetchAllTenant);

module.exports = { tenantRoute };
