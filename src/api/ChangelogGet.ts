import Express from "express";

export const ChangelogGetRouter = Express.Router();

ChangelogGetRouter.get("/", (req, res) => {
  res.status(200);
  res.json({
    changelog: [
      {
        version: "",
        title: "",
        description: "",
        date: "",
        changes: {
          new_features: [],
          improvements: ["Added dates to changelog | #BACKEND #FRONTEND", "Tag icons now take on the text color of the tag. 🌈 | #FRONTEND"],
          fixes: [
            "Fixed tag icons needing to load multiple times, because they were always new objects. (Silly Me 🥴) | #FRONTEND",
            "Fixed auto adding of tags from multiple filters to new tasks not working. | #FRONTEND",
          ],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.1.2",
        title: "Specific Task Sharing and Multiselecting Filters",
        description: "This Patch brings the option to select multiple filters and sharing the link to a specific task.",
        date: "14.02.2024",
        changes: {
          new_features: [
            "Added URL Parameter for Task ID with which you can share / reopen from link a specific task. | #FRONTEND",
            "Added the option to select multiple Filters to mix and match them. | #FRONTEND",
          ],
          improvements: [
            "Enlarged Sidebar drawer bar to make it easier on smaller screen devices to interact with it. | #FRONTEND",
            "Added application name next to the version number on pages. | #FRONTEND",
            "Log Level is now automatically set to debug when ran in Dev Mode. | #BACKEND",
            "Added info popup to the inboxes menu that explains shortly how to use inboxes. | #FRONTEND",
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
        date: "13.02.2024",
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
        date: "11.02.2024",
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
