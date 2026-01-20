const createError = require("http-errors");
const AdminProfileSchema = require("../model/AdminProfileSchema");

// fetch profile detail
const adminProfile = async (req, res, next) => {
  try {
    const profile = await AdminProfileSchema.findOne({
      adminId: req.admin.id,
    }).populate("adminId", "name mobileNo role");

    if (!profile) {
      return next(createError(404, "Profile not found"));
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

//update profile detail
const updateAdminProfile = async (req, res, next) => {
  try {
    const { name, mobileNo, address, pincode } = req.body;

    const updatedProfile = await AdminProfileSchema.findOneAndUpdate(
      { adminId: req.admin.id },
      { name, mobileNo, address, pincode },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { adminProfile, updateAdminProfile };
