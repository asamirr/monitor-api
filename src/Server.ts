import express, { Request, Response, NextFunction } from "express";
import { router as checkRouter } from "./routes /Checks";
import { usersRouter } from "../src/routes /Auth";
import consola, { Consola } from "consola";
import cors from "cors";
import * as bodyParser from "body-parser";
import * as dotENV from "dotenv";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import definition from "../swagger.json";

export class Server {
  public app: express.Application;
  public logger: Consola = consola;

  public constructor() {
    this.app = express();

    this.setConfig();
    this.setRequestLogger();
    this.setRoutes();
  }

  public start() {
    this.setConfig();
    this.setRequestLogger();
    this.setRoutes();
    this.useSwagger();

    this.app.listen(process.env.PORT, () => {
      this.logger.success(`Server started on port ${process.env.PORT}`);
    });
  }

  private setConfig() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    dotENV.config();
  }

  private setRequestLogger() {
    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      console.log(`[${req.method} - ${req.path}]`);

      next();
    });
  }

  private useSwagger() {
    const options = {
      definition,
      apis: ["./routes/*.ts"],
    };
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
  }

  private setRoutes() {
    this.app.get("/", (req: Request, res: Response) => {
      res.send("App");
    });

    this.app.use("/api/v1/auth", usersRouter);
    this.app.use("/check", checkRouter);
  }
}
