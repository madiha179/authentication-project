import { Router,Request,Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { signToken } from "../utils/token.js";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;

export const tokenRouter=Router();
tokenRouter.post('/refreshtoken',(req:Request,res:Response)=>{
const {refreshToken}=req.body;
if (!refreshToken) return res.status(401).json({ message: "No refresh token" });
try{
  const payLoad=jwt.verify(refreshToken,REFRESH_TOKEN) as JwtPayload;
  const newAccessToken=signToken(payLoad.userId);
  res.json({accessToken:newAccessToken});
}
catch(err){
  res.status(403).json({
    message:"Invalid Refresh Token"
  })
}
});