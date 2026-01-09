const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const { allocateUnit } = require("../controller/AllocationController");

const allocatUnitRouter = express.Router();

// Allocate unit
allocatUnitRouter.post("/allocate", verifyAdmin, allocateUnit);

module.exports = { allocatUnitRouter };
