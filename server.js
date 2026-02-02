require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rentDueCron = require("./cron/rentDue.cron");
const dbConnect = require("./config/dbConnect");
const { loginRouter } = require("./routers/loginRouter");
const { propertyRouter } = require("./routers/PropertyRouter");
const { tenantRoute } = require("./routers/TenantRouter");
const { allocatUnitRouter } = require("./routers/AllocationRouter");
const { rentDueRouter } = require("./routers/RentdueRouter");
const { paymentRouter } = require("./routers/PaymentRouter");
const { UnitRouter } = require("./routers/UnitRouter");
const { adminProfileRouter } = require("./routers/AdminProfileRouter");
const whatsappRouter = require("./routers/whatsappRouter");
const app = express();
app.use(express.json());

//razor pay config
const razorpay = require("./config/razorpayConfig");

//Or restrict to your frontend origin
const allowedOrigins = ["https://nest-pay.in", "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
//allow all cookies/auth headerss

// DB connect
dbConnect();

// Router
app.use("/api/auth", loginRouter);
app.use("/api/property", propertyRouter);
app.use("/api/unit", UnitRouter);
app.use("/api/tenant", tenantRoute);
app.use("/api/allocation", allocatUnitRouter);
app.use("/api/rentDue", rentDueRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminProfileRouter);
app.use("/api/whatsapp", whatsappRouter);

app.get("/", (req, res) => {
  res.send("NestPay Backend Running successfully 🚀");
});

// global Error handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Globle error hit something went wrrong";
  res.status(statusCode).json({ success: false, statusCode, message });
});

//server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT);
