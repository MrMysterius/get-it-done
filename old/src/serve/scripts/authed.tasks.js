import { getUrlParam, setUrlParam } from "./functions/authed.urlData.js";

import { TasksHandler } from "./classes/authed.TasksHandler.js";
import { checkChangelog } from "./functions/authed.checkChangelog.js";
import { checkGroup } from "./functions/authed.checkGroup.js";
import { createFilterPopup } from "./functions/authed.createFilterPopup.js";
import { createNewTask } from "./functions/authed.createNewTask.js";
import { lockTaskCreator } from "./functions/authed.lockTaskCreation.js";
import { manageGroupPopup } from "./functions/authed.manageGroupPopup.js";
import { manageInboxesPopup } from "./functions/authed.manageInboxesPopup.js";
import { manageStatesPopup } from "./functions/authed.manageStatesPopup.js";
import { manageTagsPopup } from "./functions/authed.manageTagsPopup.js";
import { manageTaskPopup } from "./functions/authed.manageTaskPopup.js";
import { manageUserPopup } from "./functions/authed.manageUserPopup.js";
import { populateFilters } from "./functions/authed.populateFilters.js";
import { populateGroups } from "./functions/authed.populateGroups.js";
import { switchGroup } from "./functions/authed.switchGroup.js";

export let loop_interval_id;
export let task_handler = new TasksHandler();

window.addEventListener("DOMContentLoaded", async (ev) => {
  checkChangelog();
  await checkGroup();
  await populateGroups();
  switchGroup();
  task_handler.setRequests();
  task_handler.populate().then(() => {
    const group_id = getUrlParam("g");
    const task_id = getUrlParam("t");
    if (!group_id || !task_id) return;
    manageTaskPopup(group_id, task_id);
  });
  populateFilters();

  // Task Send New
  document.querySelector("#task-new-title").addEventListener("keypress", async (ev) => {
    if (ev?.key != "Enter") return;
    lockTaskCreator(true);
    const res = await createNewTask();
    lockTaskCreator(false);
    if (res) await task_handler.populate();
  });

  // Group Selector Change
  document.querySelector("#group-selection").addEventListener("change", async () => {
    switchGroup();
    await task_handler.populate();
    await populateFilters();
  });

  document.querySelector("body").addEventListener("keypress", (ev) => {
    if (document.querySelector("#popup-container").childElementCount > 0) return;
    const task_titleEl = document.querySelector("#task-new-title");
    if (ev.key == "t" && task_titleEl !== document.activeElement) {
      ev.preventDefault();
      task_titleEl.focus();
    }
  });

  document.querySelector("#group-manage").addEventListener("click", () => {
    const group_id = getUrlParam("g");
    if (!group_id || group_id == "new") return;
    manageGroupPopup();
  });
  document.querySelector("#group-manage").removeAttribute("disabled");

  document.querySelector("#group-tags").addEventListener("click", () => {
    const group_id = getUrlParam("g");
    if (!group_id || group_id == "new") return;
    manageTagsPopup(group_id);
  });
  document.querySelector("#group-tags").removeAttribute("disabled");

  document.querySelector("#group-states").addEventListener("click", () => {
    const group_id = getUrlParam("g");
    if (!group_id || group_id == "new") return;
    manageStatesPopup(group_id);
  });
  document.querySelector("#group-states").removeAttribute("disabled");

  document.querySelector("#group-inboxes").addEventListener("click", () => {
    const group_id = getUrlParam("g");
    if (!group_id || group_id == "new") return;
    manageInboxesPopup(group_id);
  });
  document.querySelector("#group-inboxes").removeAttribute("disabled");

  document.querySelector("#user-settings").addEventListener("click", () => {
    manageUserPopup();
  });
  document.querySelector("#user-settings").removeAttribute("disabled");

  document.querySelector("#sidebar-menu .filters .add-filter").addEventListener("click", () => {
    const group_id = getUrlParam("g");
    if (!group_id || group_id == "new") return;
    createFilterPopup(group_id);
  });
  document.querySelector("#sidebar-menu .filters .add-filter").removeAttribute("disabled");

  document.querySelector("#sidebar-menu .filters .no-filter").addEventListener("click", () => {
    setUrlParam("f");
    populateFilters();
    task_handler.populate();
  });
  document.querySelector("#sidebar-menu .filters .no-filter").removeAttribute("disabled");

  let graceTimeID;
  document.querySelector(".quick-filters-container .quick-filter-grouping").addEventListener("change", () => {
    clearTimeout(graceTimeID);
    graceTimeID = setTimeout(() => {
      task_handler.populate(true);
    }, 500);
  });
  document.querySelector(".quick-filters-container .quick-filter-grouping").removeAttribute("disabled");

  document.querySelector(".quick-filters-container .quick-filter-sorting").addEventListener("change", () => {
    clearTimeout(graceTimeID);
    graceTimeID = setTimeout(() => {
      task_handler.populate(true);
    }, 500);
  });
  document.querySelector(".quick-filters-container .quick-filter-sorting").removeAttribute("disabled");

  document.querySelector(".quick-filters-container .quick-filter-tag-search").addEventListener("keyup", () => {
    task_handler.fullClear();
    clearTimeout(graceTimeID);
    graceTimeID = setTimeout(() => {
      task_handler.populate(true);
    }, 500);
  });
  document.querySelector(".quick-filters-container .quick-filter-tag-search").removeAttribute("disabled");

  loop_interval_id = setInterval(mainLoop, 15000);
});

export const TasksMap = new Map();

export async function mainLoop() {
  populateGroups();
  task_handler.populate();
  populateFilters();
}
