import { Schema, model, Types, Document } from "mongoose";
import mongoose from "mongoose";
export interface OTP extends Document{
userId:Types.ObjectId,
otp:string,
createdAt:Date,
expireAt:Date,
timeStamps:boolean
};
const OTPSchema =new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  otp:{
    type:String,
    required:true
  },
  createdAt:{
        type: Date,
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
        index: {expires: 0}
    }
}, { timestamps: true }
);
export default model<OTP>("OTP",OTPSchema)