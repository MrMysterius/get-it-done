import { getUrlParam, setUrlParam } from "./authed.urlData.js";

import { TasksMap } from "../authed.tasks.js";
import { createNotice } from "./createNotice.js";
import { manageTaskPopup } from "./authed.manageTaskPopup.js";
import { request } from "./request.js";

export const TagIcons = {
  context: `<object data="/assets/Context.svg" alt="Context" style="height: 18px; width: 18px; display: inline-block;" title="Context"></object>`,
  project: `<object data="/assets/Project.svg" alt="Project" style="height: 18px; width: 18px; display: inline-block;" title="Project"></object>`,
  other: `<object data="/assets/Tag.svg" alt="Tag" style="height: 18px; width: 18px; display: inline-block;" title="Tag"></object>`,
};

export async function populateTasks() {
  const group_id = getUrlParam("g");

  if (!group_id) return;

  const newTasksReq = request("GET", `/api/groups/${group_id}/tasks`);
  const filtersReq = request("GET", `/api/groups/${group_id}/filters`);

  const [newTasks, filters] = await Promise.all([newTasksReq, filtersReq]);

  if (newTasks?.status != 200 || filters?.status != 200) {
    createNotice("Couldn't get tasks", "error", 15000);
    return;
  }

  const currentFiltersList = getUrlParam("f")?.split(",") || [];
  const activeFilters = filters.data.filter((filter) => currentFiltersList.find((cf) => cf == filter.id));
  if (activeFilters.length == 0) {
    setUrlParam("f");
  }

  const newTasksMap = new Map();
  newTasks.data.map((newTask) => {
    newTasksMap.set(newTask.id, { task: newTask, fingerprint: btoa(JSON.stringify(newTask)) });
  });

  const tasksContainer = document.querySelector("#tasks");
  const taskTemplate = document.querySelector("#template-task");

  for (const [id, { task }] of TasksMap.entries()) {
    if (newTasksMap.has(id) && checkFilter(task, activeFilters)) continue;

    const taskEl = document.querySelector(`#task-${id}`);
    if (!taskEl) continue;

    taskEl.classList.add("TaskPopout");
    TasksMap.delete(id);

    setTimeout(() => {
      taskEl.remove();
    }, 2000);
  }

  for (const [id, { task, fingerprint }] of newTasksMap.entries()) {
    if ((TasksMap.has(id) && TasksMap.get(id).fingerprint == fingerprint) || !checkFilter(task, activeFilters)) continue;

    const newTaskClone = taskTemplate.content.cloneNode(true);

    newTaskClone.querySelector(".task").id = `task-${task.id}`;
    newTaskClone.querySelector(".task-title").innerHTML = task.title;

    task.tags.sort((a, b) => a.type - b.type);

    const taskTagsHTML = task.tags
      .map((tag) => {
        return `<p class="task-tag" style="background-color: ${tag.colour_background}; color: ${tag.colour_text};" title="${tag.description}">${
          TagIcons[tag.type]
        } ${tag.name}</p>`;
      })
      .join(" ");

    newTaskClone.querySelector(".task-tags").innerHTML = taskTagsHTML;

    newTaskClone.querySelector(".task").addEventListener("click", async (ev) => {
      manageTaskPopup(group_id, task.id);
    });

    if (TasksMap.has(id) && TasksMap.get(id).fingerprint != fingerprint) {
      tasksContainer.querySelector(`#task-${id}`).replaceWith(newTaskClone);
    } else {
      tasksContainer.appendChild(newTaskClone);
    }

    TasksMap.set(id, { task, fingerprint });
  }
}

export function checkFilter(task, filters) {
  if (!filters || filters.length == 0) return true;
  for (const filter of filters) {
    for (const ftag of filter.filter_data.tags) {
      if (task.tags.find((tag) => ftag == tag.name)) continue;
      return false;
    }
  }
  return true;
}
