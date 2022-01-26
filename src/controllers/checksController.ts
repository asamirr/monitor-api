import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Request, Response } from "express";
import { slackMsg } from "../utils/slack";
import { notify } from "../utils/email";

const prisma = new PrismaClient();

export const createCheck = async (req: Request, res: Response) => {
  try {
    const {
      name,
      url,
      protocol,
      path,
      port,
      webhook,
      timeout,
      interval,
      threshold,
      authentication,
      httpHeaders,
      assert,
      tags,
      ignoreSSL,
    } = req.body;
    const result = await prisma.check.findFirst({
      where: {
        name: name,
      },
    });
    if (result) {
      return res
        .status(400)
        .json({ success: false, error: "This check already exists!" });
    } else {
      const newCheck = await prisma.check.create({
        data: {
          name,
          url,
          protocol,
          path,
          port,
          webhook,
          timeout,
          interval,
          threshold,
          authentication,
          httpHeaders,
          assert,
          tags,
          ignoreSSL,
        },
      });

      if (newCheck) {
        return res
          .status(201)
          .json({ success: true, message: "Check created!" });
      } else {
        return res.status(400).json({
          success: false,
          error: "Couldn't create your check please try again!",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const editCheck = async (req: Request, res: Response) => {
  try {
    const {
      name,
      url,
      protocol,
      path,
      port,
      webhook,
      timeout,
      interval,
      threshold,
      authentication,
      httpHeaders,
      assert,
      tags,
      ignoreSSL,
    } = req.body;
    const result = await prisma.check.update({
      where: {
        name: name,
      },
      data: {
        name: name,
        url: url,
        protocol: protocol,
        path: path,
        port: port,
        webhook: webhook,
        timeout: timeout,
        interval: interval,
        threshold: threshold,
        authentication: authentication,
        httpHeaders: httpHeaders,
        assert: assert,
        tags,
        ignoreSSL: ignoreSSL,
      },
    });
    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "Check updated man!" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Check update didn't go well" });
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

export const runCheck = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const checkData = await prisma.check.findUnique({
      where: {
        name: name,
      },
    });

    if (checkData) {
      const constructURL = `${checkData.protocol}://${checkData.url}`;
      try {
        await axios.get(constructURL);
        await prisma.report.upsert({
          where: {
            name: name,
          },
          update: {},
          create: {
            name: name,
            status: "up",
            availability: 100,
            outages: 0,
            downTime: 0,
            upTime: 60,
          },
        });
      } catch {
        await prisma.report.upsert({
          create: {
            name: name,
            status: "down",
            availability: 0,
            outages: 1,
            downTime: 60,
            upTime: 0,
          },
          update: {},
          where: {
            name: name,
          },
        });
      }

      setInterval(async () => {
        const findReport = await prisma.report.findFirst({
          where: {
            name: name,
          },
        });
        const getNewURLInCheck = await prisma.check.findFirst({
          where: {
            name: name,
          },
        });
        const changingURL = `${getNewURLInCheck?.protocol}://${getNewURLInCheck?.url}`;

        try {
          await axios.get(changingURL);
          if (findReport?.status === "down") {
            notify(
              req.User.email, // try "your@email.com" for testing 
              findReport.name + "'s URL just became UP",
              "Bosta URL Monitor Notification"
            );
            slackMsg(
              getNewURLInCheck?.webhook!,
              findReport.name + "'s URL just became UPPP"
            );
          }
          const uptime = (await findReport?.upTime!) + checkData.interval! * 60;
          await prisma.report.update({
            data: {
              status: "up",
              availability: (uptime / (findReport?.downTime! + uptime)) * 100,
              outages: findReport?.outages,
              downTime: findReport?.downTime,
              upTime: uptime,
            },
            where: {
              name,
            },
          });
          await prisma.logs.create({
            data: {
              name: name,
              status: "up",
            },
          });
        } catch {
          if (findReport?.status === "up") {
            notify(
              req.User.email,
              findReport.name + "'s URL just became DOWN DOWN",
              "Bosta URL Monitor Notification"
            );
            slackMsg(
              getNewURLInCheck?.webhook!,
              findReport.name + "'s URL just became DOWN DOWN"
            );
          }

          const downtime =
            (await findReport?.downTime!) + checkData.interval! * 60;
          await prisma.report.update({
            data: {
              status: "down",
              availability:
                (findReport?.upTime! / (findReport?.upTime! + downtime)) * 100,
              outages: findReport?.outages! + 1,
              downTime: downtime,
              upTime: findReport?.upTime,
            },
            where: { name },
          });
          await prisma.logs.create({
            data: {
              name: name,
              status: "down",
            },
          });
        }
        // res.status(200).json({success: true, message: "We just ran your check!"});
      }, 4000); // ---TESTING--- checkData.interval! * 60 * 1000
    } else {
      return res
        .status(404)
        .json({ success: false, error: "This check doesn't exist" });
    }
  } catch {
    return res.status(500).json({ success: false });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const result = await prisma.report.findUnique({
      where: {
        name: req.body.name,
      },
    });
    const logs = await prisma.logs.findMany({
      where: {
        name: { in: req.body.name },
      },
    });
    if (result) {
      return res.status(200).json({ result, logs });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Report wasn't found." });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const removeCheck = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await prisma.check.findUnique({
      where: {
        name: name,
      },
    });
    if (result) {
      await prisma.check.delete({
        where: { name: name },
      });
      return res.status(200).json({ success: true, message: "Check deleted." });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Check doesn't exist." });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
