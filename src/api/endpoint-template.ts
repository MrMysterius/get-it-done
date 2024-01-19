import Express from "express";
import { validateData } from "../middlewares/validateData";

export const Router = Express.Router();

Router.get(
  "",

  // REQUEST DATA REQUIREMENTS

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {}
);
