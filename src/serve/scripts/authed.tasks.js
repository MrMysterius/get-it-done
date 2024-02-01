import { getUrlParam, setUrlParam } from "./functions/authed.urlData.js";

import { checkGroup } from "./functions/authed.checkGroup.js";
import { createNewTask } from "./functions/authed.createNewTask.js";
import { createNotice } from "./functions/createNotice.js";
import { createPopup } from "./functions/createPopup.js";
import { lockTaskCreator } from "./functions/authed.lockTaskCreation.js";
import { populateGroups } from "./functions/authed.populateGroups.js";
import { populateTasks } from "./functions/authed.populateTasks.js";
import { request } from "./functions/request.js";
import { switchGroup } from "./functions/authed.switchGroup.js";

export let loop_interval_id;

window.addEventListener("DOMContentLoaded", async (ev) => {
  await checkGroup();
  await populateGroups();
  switchGroup();
  await populateTasks();

  // Task Send New
  document.querySelector("#task-new-title").addEventListener("keypress", async (ev) => {
    if (ev?.key != "Enter") return;
    lockTaskCreator(true);
    const res = await createNewTask();
    lockTaskCreator(false);
    if (res) await populateTasks();
  });

  // Group Selector Change
  document.querySelector("#group-selection").addEventListener("change", async () => {
    switchGroup();
    await populateTasks();
  });

  document.querySelector("body").addEventListener("keypress", (ev) => {
    const task_titleEl = document.querySelector("#task-new-title");
    if (ev.key == "t" && task_titleEl !== document.activeElement) {
      ev.preventDefault();
      task_titleEl.focus();
    }
  });

  document.querySelector("#group-manage").addEventListener("click", () => {
    const group_id = getUrlParam("g");
    if (!group_id || group_id == "new") return;
    window.location.replace(`/groups?g=${group_id}`);
  });

  document.querySelector("#group-manage").removeAttribute("disabled");

  loop_interval_id = setInterval(mainLoop, 15000);
});

export const TasksMap = new Map();

export async function mainLoop() {
  populateGroups();
  populateTasks();
}
