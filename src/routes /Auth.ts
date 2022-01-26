import { Router } from "express";
import { login, register, verifyEmail } from "../controllers/userController";

export const usersRouter = Router();

usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.post("/verify", verifyEmail);
