const automationAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token !== process.env.AUTOMATION_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

module.exports = automationAuth;
