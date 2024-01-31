import { getUrlParam, setUrlParam } from "./functions/authed.urlData.js";

import { checkGroup } from "./functions/authed.checkGroup.js";
import { createNewTask } from "./functions/authed.createNewTask.js";
import { createNotice } from "./functions/authed.createNotice.js";
import { createPopup } from "./functions/authed.createPopup.js";
import { lockTaskCreator } from "./functions/authed.lockTaskCreation.js";
import { populateGroups } from "./functions/authed.populateGroups.js";
import { populateTasks } from "./functions/authed.populateTasks.js";
import { request } from "./functions/authed.request.js";
import { switchGroup } from "./functions/authed.switchGroup.js";

export let loop_interval_id;
let sidebarOpen = false;

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

  document.querySelector("#sidebar-menu-drawer").addEventListener("click", () => {
    toggleSidebar();
  });

  loop_interval_id = setInterval(mainLoop, 15000);
});

export const TasksMap = new Map();

export async function mainLoop() {
  populateGroups();
  populateTasks();
}

function toggleSidebar() {
  if (sidebarOpen) {
    sidebarOpen = false;
    document.querySelector("#sidebar-menu").classList.remove("opened");
    document.querySelector("#sidebar-menu-drawer").classList.remove("opened");
  } else {
    sidebarOpen = true;
    document.querySelector("#sidebar-menu").classList.add("opened");
    document.querySelector("#sidebar-menu-drawer").classList.add("opened");
  }
}
