const createError = require("http-errors");
const PropertiesSchema = require("../model/PropertiesSchema");
const unitSchema = require("../model/Units");
//Add new Property
const addProperty = async (req, res, next) => {
  const { propertyName, propertyAddress, totalUnits, monthlyRent } = req.body;
  // if  field missing
  if (!propertyName || !propertyAddress || !totalUnits || !monthlyRent) {
    return next(createError(401, "All Field Required"));
  }
  // save property
  try {
    const Property = await PropertiesSchema.create({
      propertyName,
      propertyAddress,
      totalUnits,
      monthlyRent,
      createdBy: req.admin.id,
    });

    // create array for all units
    const units = [];
    for (let i = 1; i <= totalUnits; i++) {
      units.push({
        propertyId: Property.id,
        unitNumber: totalUnits,
        monthlyRent: monthlyRent,
      });
    }
    //save all units inside units schema
    await unitSchema.insertMany(units);
    res.status(200).json({
      success: true,
      message: "Property  & unit Save Successfully",
      Property,
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
      count: allProperty.length,
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
    const units = await unitSchema.find({ propertyId });

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

//unit Allocation
const unitAllocation = async (req, res, next) => {
  res.json({ message: "Start" });
};

module.exports = {
  addProperty,
  fetchAllProperty,
  getSingleProperty,
  allUnit,
  unitAllocation,
};
