const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  allocateUnit,
  deAllocateUnit,
} = require("../controller/AllocationController");

const allocatUnitRouter = express.Router();

// Allocate unit
allocatUnitRouter.post("/allocate", verifyAdmin, allocateUnit);
//De-allocte unit
allocatUnitRouter.post("/deallocate/:tenantId", verifyAdmin, deAllocateUnit);

module.exports = { allocatUnitRouter };
