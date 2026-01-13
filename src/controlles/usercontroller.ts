import { Request,Response,NextFunction } from "express";
import User,{IUser} from "../models/userModel.js";
import {createSendToken} from "../utils/token.js"
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import OTP from "../models/OTPVerification.js";
import { Email } from "../utils/sendEmail.js";
import jwt, { JwtPayload } from "jsonwebtoken";
export const signUp=catchAsync(async(req:Request,res:Response)=>{
  const { name, email, password, confirm_password, photo, phone } = req.body;
  const newUser:IUser=await User.create({
    name, email, password, confirm_password, photo, phone
  });
  createSendToken(newUser,201,res);})
export const login=async (req:Request,res:Response,next:NextFunction)=>{
const {email,password}=req.body;
if(!email||!password){
  return next(new AppError("Please provide email and password",400));
}
const user:IUser=await User.findOne({email}).select('+password');
if(!user|| !await user.correctPassword(password,user.password)){
   return next(new AppError("Incorrect email or password",400));
}
createSendToken(user,200,res);
};
export const forgotPassword=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
  const email=req.body.email;
  if(!email){return next(new AppError("please provide email",400));}
  const user=await User.findOne({email});
  if(!user){return next(new AppError('email not found',400));}
  const resetToken=user.createPasswordResetToken();
  await user.save({validateBeforeSave:false});
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP=await bcrypt.hash(otp,10);
  await OTP.create({
    userId:user.id,
    otp:hashedOTP,
    createdAt:Date.now(),
    expireAt:Date.now()+10*60*1000,
  });
  try{
    await new Email(user,otp).sendResetEmail();
    res.status(200).json({
      data:{
        resetToken,
        otp
      },
      status:'success',
      message:'OTP sent to email'
    })
  }
  catch(err:any){
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save({validateBeforeSave:false});
    console.log("EMAIL ERROR:", err);
    console.log("RESPONSE:", err.response);
    console.log(" MESSAGE:", err.message);
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});
export const resetPassword=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
  //get user based on token from parameters
  const hashToken=crypto.createHash('sha256')
  .update(String(req.params.token))
  .digest('hex');
  const user=await User.findOne({passwordResetToken:hashToken,passwordResetExpires:{$gt:Date.now()}});
  if(!user){return next(new AppError('Token is Invalid or Expired',400))};
  const otpRecorded=await OTP.findOne({
    userId:user.id,
    expireAt:{$gt:Date.now()}
  });
  if(!otpRecorded)
    return next (new AppError('OTPis Invalid or Expired',400 ));
  const {otp}=req.body;
  const validOTP=await bcrypt.compare(otp,otpRecorded.otp);
  if(!validOTP) 
    return next(new AppError('Invalid OTP',400));
  user.password=req.body.password;
  user.confirm_password=req.body.confirm_password;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;
  await user.save();
  await OTP.deleteMany({userId:user.id});
  createSendToken(user,200,res);
});
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("you are not logged in! please login to get access", 401)
    );
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as jwt.JwtPayload;

const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(new AppError("user no longer exist", 401));
  }

  if (
    currentUser.lastlogout &&
    decoded.iat! * 1000 < currentUser.lastlogout.getTime()
  ) {
    return next(
      new AppError("Token Expired. Please Login again", 401)
    );
  }

  req.user = currentUser;
  next();
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(200).json({ status: "success", message: "User already logged out" });
  }

  await User.findByIdAndUpdate(req.user.id, { lastlogout: Date.now() });

  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ status: "success", message: "Successfully logged out" });
});

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
    return jwt.verify(token, REFRESH_TOKEN) as JwtPayload;
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }
};