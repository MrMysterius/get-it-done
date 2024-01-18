import Express from "express";
import { body } from "express-validator";
import { checkPassword } from "./functions/checkPassword";
import { generateAuthToken } from "./functions/generateAuthToken";
import { generateErrorWithStatus } from "./functions/generateErrorWithStatus";
import { getData } from "./functions/databaseFunctions";
import { validateData } from "./middlewares/validateData";

export const AuthRouter = Express.Router();

const SEVEN_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

AuthRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("redirect")
    .trim()
    .notEmpty()
    .isAscii()
    .customSanitizer((path: string | undefined) => {
      const match = path?.match(/^\/[\w]*$/);
      if (!match) path = undefined;
      return path;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const username = req.body.username?.trim() || null;
    const password = req.body.password?.trim() || null;

    if (!username || !password) throw generateErrorWithStatus("Missing username or password", 400);

    const user_res = getData<GIDData.user>(`SELECT * FROM users WHERE user_name = ?`, username);

    if (!user_res.data || !checkPassword(password, user_res.data.user_password_hash || "")) throw generateErrorWithStatus("Invalid username or password", 401);
    if (!user_res.data.user_active) throw generateErrorWithStatus("User is disabled", 403);

    const token = generateAuthToken({ username: user_res.data.user_name, user_id: user_res.data.user_id, role: user_res.data.user_role });

    res.cookie("token", token, { signed: true, secure: true, httpOnly: true, maxAge: SEVEN_DAY_IN_MILLISECONDS });

    if (req.body.redirect) {
      res.redirect(302, req.body.redirect);
      return;
    }

    res.status(200);
    res.json({ token });
  }
);
