import Express from "express";

export const MeGetRouter = Express.Router();

MeGetRouter.get("/", (req, res) => {
  const { user_id, user_name, user_displayname, user_role } = req.authedUser;

  res.status(200);
  res.json({
    id: user_id,
    name: user_name,
    displayname: user_displayname,
    role: user_role,
  });
});
