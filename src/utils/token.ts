import jwt, { SignOptions } from "jsonwebtoken";
import { Request,Response } from "express";
import User,{IUser} from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
interface JwtPayload {
  userId: string;
}
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRESIN = (process.env.JWT_EXPIRESIN as "15m" | "30m" | "1h") || "15m";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
const REFRESH_TOKEN_EXPIRESIN = (process.env.REFRESH_TOKEN_EXPIRESIN as "7d") || "7d";
const COOKIE_EXPIRESIN = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7; 
export const signToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRESIN };
  return jwt.sign({ userId }, JWT_SECRET, options);
};
const signRefreshToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRESIN };
  return jwt.sign({ userId }, REFRESH_TOKEN, options);
};
 export const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = signToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  const cookieOptions = {
    expires: new Date(Date.now() + COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true as boolean,
    sameSite: "strict" as const,
  };
  res.cookie("jwt", accessToken, cookieOptions);
  const userSafe = { ...user.toObject(), password: undefined };
  res.status(statusCode).json({
    status: "success",
    accessToken,
    refreshToken,
    data: { user: userSafe },
  });
};
