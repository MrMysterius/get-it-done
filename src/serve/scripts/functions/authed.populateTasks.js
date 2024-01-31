import { TasksMap } from "../authed.tasks.js";
import { createNotice } from "./createNotice.js";
import { getUrlParam } from "./authed.urlData.js";
import { request } from "./authed.request.js";

export const TagIcons = {
  context: `<object data="/assets/Context.svg" alt="Context" style="height: 18px; width: 18px; display: inline-block;" title="Context"></object>`,
  project: `<object data="/assets/Project.svg" alt="Project" style="height: 18px; width: 18px; display: inline-block;" title="Project"></object>`,
  other: `<object data="/assets/Tag.svg" alt="Tag" style="height: 18px; width: 18px; display: inline-block;" title="Tag"></object>`,
};

export async function populateTasks() {
  const group_id = getUrlParam("g");

  if (!group_id) return;

  const newTasks = await request("GET", `/api/groups/${group_id}/tasks`);
  if (newTasks?.status != 200) {
    createNotice("Couldn't get tasks", "error");
    return;
  }
  const newTasksMap = new Map();
  newTasks.data.map((newTask) => {
    newTasksMap.set(newTask.id, newTask);
  });

  const tasksContainer = document.querySelector("#tasks");
  const taskTemplate = document.querySelector("#template-task");

  for (const [id, task] of TasksMap.entries()) {
    if (newTasksMap.has(id)) continue;

    const taskEl = document.querySelector(`#task-${id}`);
    if (!taskEl) continue;

    taskEl.classList.add("TaskPopout");
    TasksMap.delete(id);

    setTimeout(() => {
      taskEl.remove();
    }, 2000);
  }

  for (const [id, task] of newTasksMap.entries()) {
    if (TasksMap.has(id)) continue;

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
      const res = await request("DELETE", `/api/groups/${group_id}/tasks/${task.id}`);
      if (res?.status != 200) {
        createNotice("Couldn't delete task", "error");
        return;
      }
      populateTasks();
    });

    tasksContainer.appendChild(newTaskClone);

    TasksMap.set(id, task);
  }
}
