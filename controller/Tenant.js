const createError = require("http-errors");
const TenantSchema = require("../model/TenantSchema");

//add new tenants
const addTenant = async (req, res, next) => {
  const { tenantName, tenantMobileNo, tenantAddress } = req.body;

  // if any Data missing
  if (!tenantName || !tenantMobileNo || !tenantAddress) {
    return next(createError(401, "All Field Required"));
  }
  // save tenant
  try {
    const tenant = await TenantSchema.create({
      tenantName,
      tenantMobileNo,
      tenantAddress,
      createdBy: req.admin.id,
      startDate: new Date(),
    });
    res.status(200).json({
      sucess: true,
      message: "Tenants Data save Successfully",
      tenant,
    });
  } catch (error) {
    next(error);
  }
};

//update tenant details
const updateTenant = async (req, res, next) => {
  const { tenant } = req.body;
  try {
    const allowedUpdate = {
      tenantName: tenant.tenantName,
      tenantMobileNo: tenant.tenantMobileNo,
      tenantAddress: tenant.tenantAddress,
    };

    const update = await TenantSchema.findByIdAndUpdate(
      tenant._id,
      allowedUpdate,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Tenant details Update successfully",
      update,
    });
  } catch (error) {
    next(error);
  }
};

//fetch single tenants by id for deactivation
const getSingleTenant = async (req, res, next) => {
  const { tenantId } = req.params;
  try {
    if (!tenantId) {
      return next(createError(401, "Tenant not fetch"));
    }
    const tenant = await TenantSchema.findById(tenantId)
      .populate("unitId")
      .populate("createdBy");
    res.status(201).json({
      success: true,
      message: "Single Tenant for tenant details",
      tenant,
    });
  } catch (error) {
    next(error);
  }
};

//fetch all tenants
const fetchAllTenant = async (req, res, next) => {
  try {
    const tenants = await TenantSchema.find({
      createdBy: req.admin.id,
    }).sort({ createdBy: -1 });

    res.status(200).json({
      success: true,
      message: "All Tenants show",
      tenants,
    });
  } catch (error) {
    next(error);
  }
};

//fetch all de-active tenants
const inActiveTenant = async (req, res, next) => {
  const { id } = req.admin;

  try {
    if (!id) {
      return next(createError(401, "Unauthorized"));
    }

    const inactiveTenants = await TenantSchema.find({
      createdBy: id, // only this admin's tenants
      status: "Inactive", // only inactive
    });

    res.status(200).json({
      success: true,
      count: inactiveTenants.length,
      message: "Inactive tenants fetched successfully",
      tenants: inactiveTenants,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTenant,
  updateTenant,
  getSingleTenant,
  fetchAllTenant,
  inActiveTenant,
};
