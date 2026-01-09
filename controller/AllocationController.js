const createError = require("http-errors");
const allocateUnitSchema = require("../model/allocateUnitSchema");
const Units = require("../model/Units");
const TenantSchema = require("../model/TenantSchema");

// unit allocation controller
const allocateUnit = async (req, res, next) => {
  const { propertyId, unitId, tenantId } = req.body;

  if (!propertyId || !unitId || !tenantId) {
    return next(createError(400, "All fields are required"));
  }

  try {
    // check unit
    const unit = await Units.findById(unitId);
    if (!unit) return next(createError(404, "Unit not found"));

    if (unit.status === "occupied") {
      return next(createError(400, "Unit already occupied"));
    }

    // check tenant
    const tenant = await TenantSchema.findById(tenantId);
    if (!tenant) return next(createError(404, "Tenant not found"));

    if (tenant.status !== "Active") {
      return next(createError(400, "Tenant is inactive"));
    }

    if (tenant.unitId) {
      return next(createError(400, "Tenant already has a unit"));
    }

    // update unit
    unit.status = "occupied";
    unit.tenantId = tenantId;
    await unit.save();

    // update tenant
    tenant.unitId = unitId;
    await tenant.save();

    // save allocation history
    const allocation = await allocateUnitSchema.create({
      propertyId,
      unitId,
      tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Unit allocated successfully",
      allocation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { allocateUnit };
