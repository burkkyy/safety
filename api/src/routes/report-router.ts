import express, { Request, Response } from "express";
import { ReportService } from "../services";
import { DateTime } from "luxon";
import { db as knex } from "../data";
import { DB_CLIENT } from "../config";

export const reportRouter = express.Router();
const db = new ReportService();

reportRouter.get("/my-reports", async (req: Request, res: Response) => {
  const list = await db.getByEmail(req.user.email);
  return res.json({ data: list });
});

reportRouter.post("/", async (req: Request, res: Response) => {
  const {} = req.body;
  req.body.email = req.user.email;
  req.body.status = "Initial Report";

  let { createDate, date } = req.body;

  let cVal = DateTime.fromISO(createDate);
  let dVal = DateTime.fromISO(date);

  if (DB_CLIENT == "oracledb") {
    req.body.createDate = knex.raw(`TO_TIMESTAMP('${cVal.toFormat("yyyy-MM-dd HH:mm:ss")}', 'YYYY-MM-DD HH24:MI:SS')`);
    req.body.date = knex.raw(`TO_TIMESTAMP('${dVal.toFormat("yyyy-MM-dd HH:mm:ss")}', 'YYYY-MM-DD HH24:MI:SS')`);
  }

  console.log("INSERTING REPORT", req.body);

  await db.create(req.body);
  return res.json({ data: [] });
});
