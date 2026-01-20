const createError = require("http-errors");
const PropertiesSchema = require("../model/PropertiesSchema");
const unitSchema = require("../model/Units");
const TenantSchema = require("../model/TenantSchema");
const rentDueSchema = require("../model/RentDueSchema");
//Add new Property
const addProperty = async (req, res, next) => {
  const { propertyName, propertyAddress, monthlyRent } = req.body;
  // if  field missing
  if (!propertyName || !propertyAddress || !monthlyRent) {
    return next(createError(404, "All Field Required"));
  }
  // save property
  try {
    const Property = await PropertiesSchema.create({
      propertyName,
      propertyAddress,
      monthlyRent,
      createdBy: req.admin.id,
    });

    // create array for all units
    /* const units = [];
    for (let i = 1; i <= totalUnits; i++) {
      units.push({
        propertyId: Property.id,
        unitNumber: totalUnits,
        monthlyRent: monthlyRent,
      });
    }
    //save all units inside units schema
    await unitSchema.insertMany(units); */
    res.status(200).json({
      success: true,
      message: "Property  & unit Save Successfully",
      Property,
    });
  } catch (error) {
    next(error);
  }
};

//update old property
const updateProperty = async (req, res, next) => {
  const { property } = req.body;
  try {
    const allowedUpdate = {
      propertyName: property.propertyName,
      propertyAddress: property.propertyAddress,
      monthlyRent: property.monthlyRent,
    };
    const updatedProperty = await PropertiesSchema.findByIdAndUpdate(
      property._id,
      allowedUpdate,
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "update successfully",
      property: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

//Fetch all Property added by admin
const fetchAllProperty = async (req, res, next) => {
  const { id } = req.admin;
  try {
    const allProperty = await PropertiesSchema.find({ createdBy: id });

    res.status(200).json({
      success: true,
      countProperty: allProperty.length,
      message: "Fetching all Property",
      allProperty,
    });
  } catch (error) {
    next(error);
  }
};

//fetch single property
const getSingleProperty = async (req, res, next) => {
  const { propertyId } = req.params;

  try {
    const property = await PropertiesSchema.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    next(error);
  }
};

//fetch all units for detailed property
const allUnit = async (req, res, next) => {
  const { propertyId } = req.params;
  try {
    const units = await unitSchema
      .find({ propertyId })
      .populate("tenantId", "tenantName tenantMobileNo");

    res.status(200).json({
      success: true,
      message: "All units fetched successfully",
      count: units.length,
      units,
    });
  } catch (error) {
    next(error);
  }
};

//for admin dashboard fetch all property + all unit +all tenant + total rent due for this month

const dashboardStats = async (req, res, next) => {
  try {
    const adminId = req.admin.id;

    // run all queries together (fast)
    const [totalProperty, totalUnit, totalActiveTenant] = await Promise.all([
      // total properties
      PropertiesSchema.countDocuments({ createdBy: adminId }),

      // total units
      unitSchema.countDocuments({}),

      // total active tenants
      TenantSchema.countDocuments({
        createdBy: adminId,
        status: "Active",
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProperty,
        totalUnit,
        totalActiveTenant,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProperty,
  updateProperty,
  fetchAllProperty,
  getSingleProperty,
  allUnit,
  dashboardStats,
};
