import Express from "express";
import { getAllData } from "@/functions/databaseFunctions";
import { validateData } from "@/middlewares/validateData";

export const InboxesGetRouter = Express.Router();

InboxesGetRouter.get(
  "/",

  // REQUEST DATA REQUIREMENTS

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const inbox_codes = getAllData<GIDData.inbox_code>(`SELECT * FROM inbox_codes WHERE inbox_owner = ?`, req.extra.params.group_id);

    if (!inbox_codes.data) throw new Error("Couldn't get inbox codes");

    res.status(200);
    res.json(
      inbox_codes.data.map((inbox_code) => {
        return {
          inbox_code: inbox_code.inbox_code,
          inbox_extras: JSON.parse(inbox_code.inbox_extras),
        };
      })
    );
  }
);
