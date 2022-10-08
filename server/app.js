import express from "express";
const app = express();
import cookieParser from "cookie-parser";

import errorMiddleware from "./middleware/error.js";

//reads header of requests, if so: parses the json text into object and puts into request.body
app.use(express.json());
app.use(cookieParser());

// Import Routes
import product from "./routes/productRoute.js";
import user from "./routes/userRoute.js";
import order from "./routes/orderRoute.js";
// Use Routes
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

//Middleware for Errors
app.use(errorMiddleware);
export default app;
