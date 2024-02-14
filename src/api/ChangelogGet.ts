import Express from "express";

export const ChangelogGetRouter = Express.Router();

ChangelogGetRouter.get("/", (req, res) => {
  res.status(200);
  res.json({
    changelog: [
      {
        version: "0.0.0",
        title: "",
        description: "",
        changes: {
          new_features: ["Added URL Parameter for Task ID with which you can share / reopen from link a specific task. | #FRONTEND"],
          improvements: [
            "Enlarged Sidebar drawer bar to make it easier on smaller screen devices to interact with it. | #FRONTEND",
            "Added application name next to the version number on pages. | #FRONTEND",
          ],
          fixes: [],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.1.1",
        title: "Changelog Introduction and Fixes",
        description: "",
        changes: {
          new_features: [
            "Added Changelog Endpoint /api/changelog | #BACKEND",
            "Added Changelog Popup 🎉 (YOU ARE LOOKIN AT IT RIGHT NOW HOORAY) | #FRONTEND",
            "Added version number to pages (Very Smol and Cute :3 🙀) | #FRONTEND",
          ],
          improvements: [
            "Scrollbars now don't show up on the Sidebar and Popups when not needed for. | #FRONTEND",
            "Added word-break to the sidebar. | #FRONTEND",
            "Added styling for task description markdown code and blockquotes (yes you can use markdown in task description amazing right 🤩) | #FRONTEND",
            "Added a bit of caching for frontend served files. | #BACKEND",
            "Some frontend code didn't utilize the async (Whoops 🥴) part of requests so now you should see faster menu loading times, because of concurrent requests. | #FRONTEND",
          ],
          fixes: [
            "Getting specific Group route not returning group information for group members (besides group owner) | #BACKEND",
            "Filter list not updating when switching groups | #FRONTEND",
            "Tag names for filter, inbox and task tags routes weren't sanitized causing problems with the Frontend and data expectations. | #BACKEND",
            "Tag description when editing tags wasn't filled with current description | #FRONTEND",
            "When updating tags it will no longer throw an 'tag already existing' error when using the same name | #BACKEND",
            "Auto adding tags with escaped characters from filters didn't work when adding a new Task | #FRONTEND",
          ],
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
