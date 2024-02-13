import Express from "express";

export const ChangelogGetRouter = Express.Router();

ChangelogGetRouter.get("/", (req, res) => {
  res.status(200);
  res.json({
    changelog: [
      {
        version: "0.1.1",
        title: "",
        description: "",
        changes: {
          new_features: ["Added Changelog Endpoint /api/changelog"],
          improvements: [],
          fixes: [],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.1.0",
        title: "ALPHA Release",
        description: "A usable Version of the Project. That can be tested from testers.",
        changes: {
          new_features: ["Added the Backend for interacting with stored data anywhere.", "Added Frontend for Interacting with the Backend as a Human."],
          improvements: [],
          fixes: [],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
    ],
  });
});
