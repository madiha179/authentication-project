import { model } from "mongoose";
import mongoose from "mongoose";
;
const OTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }
}, { timestamps: true });
export default model("OTP", OTPSchema);
