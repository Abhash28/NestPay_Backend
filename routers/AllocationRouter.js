const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  allocateUnit,
  deAllocateUnit,
  tenantInfo,
  tenantHome,
} = require("../controller/AllocationController");

const allocatUnitRouter = express.Router();

// Allocate unit
allocatUnitRouter.post("/allocate", verifyAdmin, allocateUnit);
//De-allocte unit
allocatUnitRouter.post("/deallocate/:tenantId", verifyAdmin, deAllocateUnit);
//fetch details for admin side to show the detail of tenant
allocatUnitRouter.get("/tenant-info/:tenantId", verifyAdmin, tenantInfo);
//tenant info for tenant side basic detail like {property name ,address,unit,rent}
allocatUnitRouter.get("/tenant/home", verifyAdmin, tenantHome);

module.exports = { allocatUnitRouter };
