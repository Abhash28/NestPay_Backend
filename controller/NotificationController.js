const FcmToken = require("../model/FcmTokenSchema");
const {
  pushNotification,
} = require("../services/Notification/pushNotification");

/**
 * Save or update FCM token
 * - Supports multiple devices per user
 * - Prevents duplicate tokens
 * - Reactivates token on re-login
 */
const saveFcmToken = async (req, res, next) => {
  try {
    const { token, deviceType = "web" } = req.body;

    if (!token) {
      return res.status(400).json({ message: "FCM token is required" });
    }

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

    /**
     * STEP 1: If this token exists for any user, deactivate it
     * (prevents token reuse bugs)
     */
    await FcmToken.updateMany({ token }, { isActive: false });

    /**
     * STEP 2: Upsert token for this user & device
     */
    await FcmToken.findOneAndUpdate(
      { ownerId, ownerType, token },
      {
        ownerId,
        ownerType,
        token,
        isActive: true,
        lastUsedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    /**
     * STEP 3: Optional welcome notification
     * (safe because data-only payload)
     */
    setTimeout(() => {
      pushNotification(
        [token],
        "Welcome to NestPay 🎉",
        ownerType === "admin"
          ? "Your admin dashboard is ready to manage properties."
          : "Welcome! Your tenant account is now active.",
        "https://nest-pay.in",
      ).catch(console.error);
    }, 90 * 1000);

    res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveFcmToken };
