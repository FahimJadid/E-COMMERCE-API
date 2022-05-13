import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

//Uncaught Exception handling
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Uncaught Exception");
  process.exit(1);
});

//Config env
dotenv.config({ path: "server/config/config.env" });

// Database Connection
connectDB();

const port = process.env.PORT || "3000";

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
