const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const { loginRouter } = require("./routers/loginRouter");
const { propertyRouter } = require("./routers/PropertyRouter");
const { tenantRoute } = require("./routers/TenantRouter");
const { allocatUnitRouter } = require("./routers/AllocationRouter");

//config dotenv file data
dotenv.config();
//for use express data or libarary
const app = express();
app.use(express.json());

//Or restrict to your frontend origin
app.use(
  cors({ origin: "https://nestpay-frontend.vercel.app", credentials: true })
); //allow all cookies/auth headerss

// DB connect
dbConnect();

// Router
app.use("/api/auth", loginRouter);
app.use("/api/property", propertyRouter);
app.use("/api/tenant", tenantRoute);
app.use("/api/allocation", allocatUnitRouter);

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
