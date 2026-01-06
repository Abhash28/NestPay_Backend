const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "You are not authenticated"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.admin = decoded;
    next();
  } catch (err) {
    next(createError(401, "Invalid or expired token"));
  }
};

module.exports = verifyAdmin;
