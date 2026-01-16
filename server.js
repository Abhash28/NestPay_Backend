const express = require("express");
require("dotenv").config();
const cors = require("cors");
const rentDueCron = require("./cron/rentDue.cron");
const dbConnect = require("./config/dbConnect");
const { loginRouter } = require("./routers/loginRouter");
const { propertyRouter } = require("./routers/PropertyRouter");
const { tenantRoute } = require("./routers/TenantRouter");
const { allocatUnitRouter } = require("./routers/AllocationRouter");
const { rentDueRouter } = require("./routers/RentdueRouter");
const { paymentRouter } = require("./routers/PaymentRouter");

//config dotenv file data

//for use express data or libarary
const app = express();
app.use(express.json());

//Or restrict to your frontend origin
app.use(cors({ origin: "http://localhost:5173", credentials: true })); //allow all cookies/auth headerss

// DB connect
dbConnect();

// Router
app.use("/api/auth", loginRouter);
app.use("/api/property", propertyRouter);
app.use("/api/tenant", tenantRoute);
app.use("/api/allocation", allocatUnitRouter);
app.use("/api/rentDue", rentDueRouter);
app.use("/api/payment", paymentRouter);

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
