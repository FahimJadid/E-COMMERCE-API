import mongoose from "mongoose";

const connectDB = async () => {
  const DB_OPTIONS = {
    dbName: process.env.DB_NAME,
  };
  const data = await mongoose.connect(process.env.DATABASE_URL, DB_OPTIONS);
  console.log(
    `MongoDB Connected Succesfully with server: ${data.connection.host}`
  );
};

export default connectDB;
