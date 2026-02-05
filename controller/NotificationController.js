const FcmToken = require("../model/FcmTokenSchema");
const {
  pushNotification,
} = require("../services/Notification/pushNotification");

const saveFcmToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    let ownerId;
    let ownerType;

    if (req.admin) {
      ownerId = req.admin.id;
      ownerType = "admin";
    } else if (req.tenant) {
      ownerId = req.tenant.id;
      ownerType = "tenant";
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await FcmToken.updateOne(
      { ownerId, ownerType, token },
      { isActive: true },
      { upsert: true },
    );
    await pushNotification(
      [token], //  MUST be array
      "Welcome to NestPay 🎉",
      ownerType === "admin"
        ? "Your admin dashboard is ready to manage properties."
        : "Welcome! Your tenant account is now active.",
    );
    res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveFcmToken };
