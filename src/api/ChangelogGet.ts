import Express from "express";

export const ChangelogGetRouter = Express.Router();

ChangelogGetRouter.get("/", (req, res) => {
  res.status(200);
  res.json({
    changelog: [
      {
        version: "0.2.6",
        title: "Hotfix Database Creation",
        description: "Hotfix for database creation. Database creation did not incorporate the new task creation and last edit timestamp columns.",
        date: "06.03.2024",
        changes: {
          new_features: [],
          improvements: [],
          fixes: ["Fixed database creation not having new task creation and last edit timestamp column. | #BACKEND"],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.2.5",
        title: "Collapsable Groupings, Task Creation/Edit Timestamps and Migration Fixes",
        description:
          "Added the possibility to declutter by collapsing task groupings. Also tasks save their creation timestamp, as well as their last edit timestamp. This is beneficial for future grouping possibilites. Also fixes some migration function problems.",
        date: "05.03.2024",
        changes: {
          new_features: ["Groupings of tasks can now be collapsed to declutter. 🚮 | #FRONTEND", "Added migration for 0.2.5 🔼 | #BACKEND"],
          improvements: [
            "Redirecting unauthed users from tasks page to login/signup ↩ | #FRONTEND",
            "Tasks now save creation and last edit timestamps. ⏱ | #BACKEND",
          ],
          fixes: ["Fixed migrations checks trying to apply older migrations. 😐 | #BACKEND"],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.2.4",
        title: "Default Task State, Database Migrations and other smol Improvements",
        description: `A state can now be set to be the default state, which is then applied to all new tasks upon creation. To make this possible Database Migration checks and files where also added. Also there are some additional smol Improvements :3`,
        date: "01.03.2024",
        changes: {
          new_features: [
            "Added database migrator check | #BACKEND",
            "Added migration for 0.2.4 🔼 | #BACKEND",
            "Added option to mark a state as default for new tasks 😎 | #BACKEND #FRONTEND",
          ],
          improvements: ["Added loading animation for login/signup page 🤩 | #FRONTEND", "Improved markdown conversions on task description | #FRONTEND"],
          fixes: [
            "Fixed removing tags from task with special HTML characters 😶 | #BACKEND",
            "Styling fix for sort and grouping options on smaller screen devices. ✨ | #FRONTEND",
          ],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.2.3",
        title: "Smol Hotfix",
        description: "I am screwing up bad time with smol i forgor moments 🤡 😭",
        date: "19.02.2024",
        changes: {
          new_features: [],
          improvements: [],
          fixes: [],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.2.2",
        title: "Smol Hotfix",
        description: "",
        date: "19.02.2024",
        changes: {
          new_features: [],
          improvements: [],
          fixes: ["Task population wasn't blocked while it already populated causing problems with reset variables. | #FRONTEND"],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.2.1",
        title: "Smol Hotfix",
        description: "",
        date: "19.02.2024",
        changes: {
          new_features: [],
          improvements: [],
          fixes: ["Added default and check for when filters are not present. | #FRONTEND"],
          refactors: [],
          deprecations: [],
          removed: [],
        },
      },
      {
        version: "0.2.0",
        title: "Quick Grouping and Sorting - State Selection",
        description:
          "Refactored Populating Tasks into its own handler and added Quick Grouping and Sorting functionality. As well as adding the option to select/apply a state to a task.",
        date: "19.02.2024",
        changes: {
          new_features: [
            "Added option to select/apply a state to a task. 🗿 | #FRONTEND",
            "Added quick filter options, to group by and sort by something. | #FRONTEND",
            "Added class for handling multiple requests at once. | #FRONTEND",
          ],
          improvements: [
            "Displaying task state by changing background and text color accordingly. | #FRONTEND",
            "Moved the small screen menu drawer button to the bottom for better access and taking less space. | #FRONTEND",
          ],
          fixes: ["Unnested CSS stylings in order to support older browser versions better. | #FRONTEND"],
          refactors: ["Populating tasks got refactored into a TaskHandler Class. | #FRONTEND"],
          deprecations: ["Old populateTasks function is deprecated and isn't used anymore. | #FRONTEND"],
          removed: [],
        },
      },
      {
        version: "0.1.3",
        title: "Some Fixes regarding Tags",
        description: "Fixed some stuff that has to do with Tags.",
        date: "15.02.2024",
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
