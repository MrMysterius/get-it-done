import Express from "express";
import { checkPassword } from "./functions/checkPassword";
import { generateAuthToken } from "./functions/generateAuthToken";
import { getData } from "./functions/databaseFunctions";

export const AuthRouter = Express.Router();

const SEVEN_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

AuthRouter.post("/", (req, res) => {
  const username = req.body.username?.trim() || null;
  const password = req.body.password?.trim() || null;

  if (!username || !password) {
    const error = new Error("Missing Username or Password");
    error.status = 401;
    throw error;
  }

  const user_res = getData<GIDData.user>(`SELECT * FROM users WHERE user_name = ?`, username);

  if (!user_res.data || !checkPassword(password, user_res.data.user_password_hash || "")) {
    const error = new Error("Invalid username or password");
    error.status = 403;
    throw error;
  }

  const token = generateAuthToken({ username: user_res.data.user_name, user_id: user_res.data.user_id, role: user_res.data.user_role });

  res.status(200);
  res.cookie("token", token, { signed: true, secure: true, httpOnly: true, maxAge: SEVEN_DAY_IN_MILLISECONDS });
  res.json({ token });
});
