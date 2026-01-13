import { signUp,login, forgotPassword, resetPassword, protect, logout } from "../controlles/usercontroller.js";
import { Router } from "express";
export const userRouter=Router();
userRouter.post('/signup',signUp);
userRouter.post('/login',login);
userRouter.post('/forgotpassword',forgotPassword);
userRouter.patch('/resetpassword/:token',resetPassword);
userRouter.post('/logout',protect,logout);