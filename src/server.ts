import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./controlles/errorcontroller.js";
import { userRouter } from "./routes/userRoute.js";
import { tokenRouter } from "./routes/tokenRoute.js";
const app=express();
dotenv.config({path:'config.env'});
const PORT=process.env.PORT||3000;
const DATABASE=process.env.DATABASE;
app.use(express.json());
app.use(cookieParser());
mongoose.connect(DATABASE!)
  .then(() => console.log("DB connect successful ✅"))
  .catch(err => console.error("DB connection error ❌", err));
  app.use('/api/v1/users',userRouter);
  app.use('/api/v1/auth',tokenRouter);
  app.use(globalErrorHandler);
  app.listen(PORT,()=>{
    console.log(`working on ${PORT} `);
  });