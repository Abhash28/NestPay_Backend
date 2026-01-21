const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors"); // createError is not a build in function in node js while we in import from http-error
const SignupSchema = require("../model/SignupSchema");
const TenantAuthSchema = require("../model/TenantAuthSchema");
const adminProfileSchema = require("../model/AdminProfileSchema");

//signup request
const signup = async (req, res, next) => {
  try {
    const { name, mobileNo, password } = req.body;

    // validation
    if (!name || !mobileNo || !password) {
      return next(createError(400, "All fields are required"));
    }

    // check if mobile already exists
    const duplicateUser = await SignupSchema.findOne({ mobileNo });
    if (duplicateUser) {
      return next(createError(409, "Mobile number already present"));
    }

    // hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // create admin signup (AUTH)
    const admin = await SignupSchema.create({
      name,
      mobileNo,
      password: hashedPass,
      role: "admin",
    });
    console.log("Admin created ");

    // create admin profile (PROFILE)
    const profile = await adminProfileSchema.create({
      adminId: admin._id,
      name: admin.name,
      mobileNo: admin.mobileNo,
    });
    console.log("ADMIN PROFILE CREATED");
    res.status(201).json({
      success: true,
      message: "Signup successfully",
      adminId: admin._id,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

//login
const login = async (req, res, next) => {
  const { mobileNo, password } = req.body;

  if (!mobileNo || !password) {
    return next(createError(400, "All fields are required"));
  }

  try {
    let user = await SignupSchema.findOne({ mobileNo });
    let role;
    let businessId;

    if (user) {
      role = "admin";
      businessId = user._id;
    } else {
      user = await TenantAuthSchema.findOne({ mobileNo }).populate(
        "tenantId",
        "status",
      );
      if (!user) {
        return next(createError(404, "User not found"));
      }

      //  BLOCK INACTIVE TENANT
      if (user.tenantId.status !== "Active") {
        return next(
          createError(403, "Your account is inactive. Please contact admin"),
        );
      }

      role = "tenant";
      businessId = user.tenantId._id;
    }

    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
      return next(createError(401, "Invalid credentials"));
    }

    const token = jwt.sign(
      {
        id: businessId,
        role,
        mobileNo: user.mobileNo,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successfully",
      token,
      role,
    });
  } catch (error) {
    next(error);
  }
};

//check user for change pass
const checkUser = async (req, res, next) => {
  const { mobileNo } = req.body;

  try {
    // Check Admin
    let user = await SignupSchema.findOne({ mobileNo });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User Found",
        role: "admin",
      });
    }

    // Check Tenant
    user = await TenantAuthSchema.findOne({ mobileNo });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User Found",
        role: "tenant",
      });
    }

    // 3️⃣ Not found in both
    return next(createError(404, "User not found"));
  } catch (error) {
    next(error);
  }
};
//change password

const changePass = async (req, res, next) => {
  const { mobileNo, password } = req.body;

  try {
    let user = await SignupSchema.findOne({ mobileNo });
    let role = "admin";

    // If not admin, check tenant
    if (!user) {
      user = await TenantAuthSchema.findOne({ mobileNo });
      role = "tenant";
    }

    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Hash new password
    const hashedPass = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPass;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      role,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, checkUser, changePass };
