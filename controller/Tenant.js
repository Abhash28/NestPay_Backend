const createError = require("http-errors");
const bcrypt = require("bcrypt");
const TenantSchema = require("../model/TenantSchema");
const TenantAuthSchema = require("../model/TenantAuthSchema");
const allocateUnitSchema = require("../model/allocateUnitSchema");
//---------Add New Tenant---------
const addTenant = async (req, res, next) => {
  const { tenantName, tenantMobileNo, tenantAddress } = req.body;

  // if any Data missing
  if (!tenantName || !tenantMobileNo || !tenantAddress) {
    return next(createError(401, "All Field Required"));
  }

  // prevent duplicate tenant login
  const existingAuth = await TenantAuthSchema.findOne({
    mobileNo: tenantMobileNo,
  });
  if (existingAuth) {
    return next(createError(409, "Tenant login Already Exists"));
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

    //generate SIMPLE random password
    const plainPassword = Math.random().toString(36).slice(-8);
    //hash password
    const hashPass = await bcrypt.hash(plainPassword, 10);

    //create login
    await TenantAuthSchema.create({
      tenantId: tenant._id,
      mobileNo: tenantMobileNo,
      password: hashPass,
      role: "tenant",
    });

    //response
    res.status(200).json({
      sucess: true,
      message: "Tenants Data save Successfully",
      tenant,
      loginCredentials: {
        mobileNo: tenantMobileNo,
        password: plainPassword,
      },
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
      { new: true },
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

//fetch all tenants
const fetchAllTenant = async (req, res, next) => {
  try {
    const tenants = await TenantSchema.find({
      createdBy: req.admin.id,
    }).populate({
      path: "unitId",
      select: "unitName propertyId",
      populate: { path: "propertyId", select: "propertyName" },
    });

    res.status(200).json({
      success: true,
      message: "All Tenants show",
      tenants,
    });
  } catch (error) {
    next(error);
  }
};

//-----Fetch Tenant by Tenant login for display in tenant side
const fetchTenant = async (req, res, next) => {
  const { id } = req.admin;
  try {
    const tenant = await TenantSchema.findById(id);
    res.status(200).json({ tenant });
  } catch (error) {
    next(error);
  }
};

//fetch profile detail for tenant side show in profile
const tenantProfile = async (req, res, next) => {
  const { id } = req.tenant;
  try {
    const profile = await TenantSchema.findById(id);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addTenant,
  updateTenant,
  fetchAllTenant,
  fetchTenant,
  tenantProfile,
};
