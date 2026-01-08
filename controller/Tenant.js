const createError = require("http-errors");
const TenantSchema = require("../model/TenantSchema");
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

module.exports = { addTenant, fetchAllTenant };
