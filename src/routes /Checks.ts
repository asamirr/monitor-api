import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";

import {
  createCheck,
  editCheck,
  getReport,
  removeCheck,
  runCheck,
} from "../controllers/checksController";

export const router = Router();

router.post("/create", isAuthenticated, createCheck);
router.post("/edit", isAuthenticated, editCheck);
router.post("/run", isAuthenticated, runCheck);
router.get("/report", isAuthenticated, getReport);
router.post("/remove", isAuthenticated, removeCheck);
