const PropertiesSchema = require("../model/PropertiesSchema");
const Units = require("../model/Units");
const createError = require("http-errors"); // if you are using this

//create new unit
const createUnit = async (req, res, next) => {
  const { adminid } = req.admin;
  try {
    const { propertyId, unitName, monthlyRent } = req.body;

    // validation
    if (!propertyId || !unitName || !monthlyRent) {
      return next(createError(400, "All fields are required"));
    }

    const unit = await Units.create({
      adminId: req.admin.id,
      propertyId,
      unitName,
      monthlyRent,
    });
    //Count total unit and update in property section where how many unit have in this property
    await PropertiesSchema.findByIdAndUpdate(
      propertyId,
      { $inc: { totalUnit: 1 } },
      { new: true },
    );

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      unit,
    });
  } catch (error) {
    next(error);
  }
};

// edit unit or update unit data
const updateUnit = async (req, res, next) => {
  const { unitId, unitName, monthlyRent } = req.body;
  try {
    if (!unitName || !monthlyRent) {
      return next(createError(404, "All Field required"));
    }
    const update = await Units.findByIdAndUpdate(
      unitId,
      { unitName, monthlyRent },
      { new: true },
    );
    res
      .status(200)
      .json({ success: true, message: "Unit update Successfully", update });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUnit, updateUnit };
