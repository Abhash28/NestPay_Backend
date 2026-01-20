const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(createError(401, "Token missing"));

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) return next(createError(403, "Invalid token"));

    if (decoded.role === "admin") {
      req.admin = { id: decoded.id };
    } else if (decoded.role === "tenant") {
      req.tenant = { id: decoded.id };
    }

    next();
  });
};

module.exports = { verifyAdmin };
