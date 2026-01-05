const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors"); // createError is not a build in function in node js while we in import from http-error
const SignupSchema = require("../model/SignupSchema");

//signup request
const signup = async (req, res, next) => {
  const { name, mobileNo, password } = req.body;
  //valodation
  if (!name || !mobileNo || !password) {
    return next(createError(400, "All Field Required"));
  }
  //check if obile no already prasent
  const duplicateUser = await SignupSchema.findOne({ mobileNo });
  if (duplicateUser) {
    return next(createError(401, "Mobile No Already Prasent"));
  }
  //convert password to hased
  const hasedPass = await bcrypt.hash(password, 10);

  try {
    // save user
    const response = await SignupSchema.create({
      name,
      mobileNo,
      password: hasedPass,
    });
    res
      .status(201)
      .json({ success: true, message: "Signup Sucessfully", response });
  } catch (error) {
    next(error);
  }
};

//login
const login = async (req, res, next) => {
  const { mobileNo, password } = req.body;
  //validation
  if (!mobileNo || !password) {
    return next(createError(400, "All Field require while login"));
  }

  try {
    //find user by mobile no for login
    const validUser = await SignupSchema.findOne({ mobileNo });
    if (!validUser) {
      return next(createError(404, "User not found "));
    }

    //verify password
    const isPassMatch = await bcrypt.compare(password, validUser.password);
    if (!isPassMatch) {
      return next(createError(401, "Invalid credentials"));
    }
    //token
    const token = jwt.sign(
      {
        id: validUser._id,
        name: validUser.name,
        mobileNo: validUser.mobileNo,
      },
      process.env.SECRET_KEY
    );

    // set cookies
    res.cookie("accessCookie", token, { httpOnly: true }).status(200).json({
      success: true,
      message: "successfully login with sebding cookies to client",
    });
  } catch (error) {
    next(error);
  }
};

//logout
const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("accessCookie")
      .status(200)
      .json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    next(error);
  }
};
//check user for change pass
const checkUser = async (req, res, next) => {
  const { mobileNo } = req.body;
  try {
    const findUser = await SignupSchema.findOne({ mobileNo });
    if (!findUser) {
      return next(createError(200, "User not found"));
    }
    res.status(200).json({ success: true, message: "User Found" });
  } catch (error) {
    next(error);
  }
};
//change password
const changePass = async (req, res, next) => {
  const { mobileNo, password } = req.body;
  try {
    const findUser = await SignupSchema.findOne({ mobileNo });
    //validation
    if (!findUser) {
      return next(createError(200, "User not found"));
    }
    //convert password to hased pass
    const hasedPass = await bcrypt.hash(password, 10);
    // change old pass to new
    findUser.password = hasedPass;
    await findUser.save();
    //return res to frontend
    res
      .status(200)
      .json({ success: true, message: "Password update successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = { signup, login, logout, checkUser, changePass };
