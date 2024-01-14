import Express from "express";

export function checkAuthStatus(need_auth = true) {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    if (need_auth && !req.isAuthed) {
      const error = new Error("Unautherized Access");
      error.status = 403;
      throw error;
    }
    next();
  };
}
