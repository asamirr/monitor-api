import { PrismaClient } from "@prisma/client";
import e, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { auth } from "src/controllers/userController";

const prisma = new PrismaClient();

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers["authorization"]) {
    return res
      .status(400)
      .json({ success: false, error: "Missing Auth Header!" });
  }

  const authHeader: string = req.headers["authorization"];
  const authMethod: string = authHeader.split(" ")[0];
  const accessToken: string = authHeader.split(" ")[1];

  if (!authMethod || !accessToken) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid Auth Header" });
  } else if (authMethod !== "Bearer") {
    return res
      .status(400)
      .json({ success: false, error: "Invalid Auth Method" });
  }

  let token: any;

  try {
    token = jwt.verify(accessToken, "secret");
  } catch {
    return res.status(400).json({ success: false, error: "Invalid Token!" });
  }
  const user = await prisma.user.findUnique({
    where: {
      email: token.email,
    },
  });
  if (!user) {
    return res.status(400).json({ success: false, error: "Invalid Token!" });
  }

  req.User = user;
  next();
};
