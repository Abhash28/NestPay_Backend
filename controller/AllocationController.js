const createError = require("http-errors");
const allocateUnitSchema = require("../model/allocateUnitSchema");
const Units = require("../model/Units");
const TenantSchema = require("../model/TenantSchema");

// unit allocation controller
const allocateUnit = async (req, res, next) => {
  const { propertyId, unitId, tenantId } = req.body;
  const adminId = req.admin.id;

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

    //Decide billing Date
    let billingDay = new Date().getDate();
    //normalize month date
    if (billingDay > 28) {
      billingDay = 1;
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
      adminId,
      propertyId,
      unitId,
      tenantId,
      rentAmount: unit.monthlyRent,
      billingDay,
      startDate: new Date(),
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

//Unit DeAllocation controller
const deAllocateUnit = async (req, res, next) => {
  const { tenantId } = req.params;
  const { endDate, deactivateReason, deactivateRemark } = req.body;
  try {
    //Find tenants
    const tenant = await TenantSchema.findById(tenantId);
    if (!tenant) {
      return next(createError(401, "Tenant not found"));
    }
    if (!tenant.unitId) {
      return next(createError(401, "Tenant has no allocation "));
    }
    // find unit
    const unit = await Units.findById(tenant.unitId);
    if (!unit) {
      return next(createError(404, "Unit not found"));
    }

    //update unit (vacant,tenantid= null)
    unit.status = "vacant";
    unit.tenantId = null;
    await unit.save();

    //update tenants and close record
    tenant.unitId = null;
    tenant.status = "Inactive";
    tenant.endDate = endDate || new Date();
    tenant.deactivateReason = deactivateReason || null;
    tenant.deactivateRemark = deactivateRemark || null;
    await tenant.save();

    //close alocation card (schema)
    await allocateUnitSchema.findOneAndUpdate(
      {
        tenantId,
        unitId: unit._id,
      },
      {
        status: "Inactive",
        endDate: new Date(),
      },
    );
    res
      .status(200)
      .json({ success: true, message: "Unit deAllocated Successfully" });
  } catch (error) {
    next(error);
  }
};

//fetch single tenants by id for deactivation and show detail info about tenant and there alloted property unit

const tenantInfo = async (req, res, next) => {
  const { tenantId } = req.params;

  try {
    if (!tenantId) {
      return next(createError(400, "Tenant id required"));
    }

    const allocation = await allocateUnitSchema
      .findOne({ tenantId })
      .populate("tenantId")
      .populate("unitId")
      .populate("propertyId")
      .populate("adminId");

    if (!allocation) {
      return next(createError(404, "No active allocation found"));
    }

    res.status(200).json({
      success: true,
      message: "Tenant + Unit + Allocation details",
      allocation,
    });
  } catch (error) {
    next(error);
  }
};

//fetch detail for tenant side show the detail {property name ,address,unit ,rent} allocation schema store all info
const tenantHome = async (req, res, next) => {
  const { id } = req.tenant;
  const tenantInfo = await allocateUnitSchema
    .findOne({ tenantId: id })
    .populate("adminId", "name mobileNo")
    .populate("propertyId", "propertyName propertyAddress")
    .populate("unitId", "unitName");
  res.json({ tenantInfo });
};

module.exports = { allocateUnit, deAllocateUnit, tenantInfo, tenantHome };
