import e, { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import argon2, { hash } from "argon2";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { idText } from "typescript";

export const auth = Router();

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    const result = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (result) {
      return res
        .status(400)
        .json({ success: false, error: "User exists man come on!! " });
    }

    const hashedPassword = await argon2.hash(password);
    const verifCode = Math.ceil(Math.random() * 10000);
    await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
        verifCode: verifCode,
        isVerified: false,
      },
    });
    return res.status(201).json({ success: true, verificationCode: verifCode });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    const token = jwt.sign(
      {
        id: user?.id,
        email: user?.email,
        verification: user?.isVerified,
      },
      "secret"
    );

    if (user) {
      const correctPassword = await argon2.verify(user.password, password);
      if (correctPassword) {
        return res.status(200).json({ success: true, accessToken: token });
      } else {
        return res
          .status(400)
          .json({ success: false, error: "Invalid Passwooord" });
      }
    } else {
      return res.status(401).json({ success: false, error: "Wrong username" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, verifCode } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (user?.isVerified) {
      return res
        .status(200)
        .json({
          success: true,
          message: "You're already verified stop wasting our time",
        });
    } else {
      if (user?.verifCode === verifCode) {
        await prisma.user.update({
          where: {
            email: email,
          },
          data: { isVerified: true },
        });
        return res
          .status(201)
          .json({ success: true, message: "You're now verified!" });
      } else {
        return res
          .status(400)
          .json({ success: false, error: "Wrong code babes" });
      }
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
