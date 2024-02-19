import { getUrlParam, setUrlParam } from "./authed.urlData.js";

import { RequestHandler } from "../classes/authed.RequestHandler.js";
import { TasksMap } from "../authed.tasks.js";
import { createNotice } from "./createNotice.js";
import { manageTaskPopup } from "./authed.manageTaskPopup.js";
import { request } from "./request.js";

export const TagIcons = {
  context: `<object data="/assets/Context.svg" alt="Context" style="height: 18px; width: 18px; display: inline-block;" title="Context"></object>`,
  project: `<object data="/assets/Project.svg" alt="Project" style="height: 18px; width: 18px; display: inline-block;" title="Project"></object>`,
  other: `<object data="/assets/Tag.svg" alt="Tag" style="height: 18px; width: 18px; display: inline-block;" title="Tag"></object>`,
};

export const TagIconsMap = {
  context: "/assets/Context.svg",
  project: "/assets/Project.svg",
  other: "/assets/Tag.svg",
};

export async function populateTasks(forceClear = false) {
  const group_id = getUrlParam("g");

  if (!group_id) return;

  const Requests = new RequestHandler();
  Requests.prepareRequest("tasks", {
    method: "GET",
    url: `/api/groups/${group_id}/tasks`,
  });
  Requests.prepareRequest("filters", {
    method: "GET",
    url: `/api/groups/${group_id}/filters`,
  });
  Requests.prepareRequest("states", {
    method: "GET",
    url: `/api/groups/${group_id}/states`,
  });

  await Requests.makeRequest();

  const newTasks = Requests.getResponse("tasks");
  const filters = Requests.getResponse("filters");
  const states = Requests.getResponse("states");

  if (!Requests.checkStatusAll(200)) {
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

  const groupingEl = document.querySelector(".quick-filters-container .quick-filter-grouping");
  if (forceClear) {
    for (const [id, obj] of TasksMap.entries()) {
      const taskEl = document.querySelector(`#task-${id}`);
      taskEl?.classList.add("TaskPopout");
      TasksMap.delete(id);
      taskEl?.remove();
    }
    for (const [id, obj] of newTasksMap.entries()) {
      const taskEl = document.querySelector(`#task-${id}`);
      taskEl?.classList.add("TaskPopout");
      TasksMap.delete(id);
      taskEl?.remove();
    }
    for (const el of Array.from(document.querySelectorAll("#tasks .grouping-div"))) {
      el.remove();
    }

    switch (groupingEl?.value) {
      case "state-grouping-asc":
        {
          for (const state of states.data.map((s) => s.name)) {
            if (state == "null") continue;
            const el = document.createElement("div");
            el.classList.add("grouping-div");
            el.id = `group-${state.replace(/ /g, "-")}`;
            el.innerHTML += `<h4>${state}</h4><hr><div class="tasks"></div>`;
            document.querySelector("#tasks").appendChild(el);
          }
          const el = document.createElement("div");
          el.classList.add("grouping-div");
          el.id = `group-null`;
          el.innerHTML += `<h4>Other</h4><hr><div class="tasks"></div>`;
          document.querySelector("#tasks").appendChild(el);
        }
        break;
      case "state-grouping-dec":
        {
          for (const state of Object.keys(
            Array.from(newTasksMap.entries()).reduce((p, c) => {
              p[c[1]?.task?.state?.name || "null"] = 1;
              return p;
            }, {})
          ).sort((a, b) => b.localeCompare(a))) {
            if (state == "null") continue;
            const el = document.createElement("div");
            el.classList.add("grouping-div");
            el.id = `group-${state.replace(/ /g, "-")}`;
            el.innerHTML += `<h4>${state}</h4><hr><div class="tasks"></div>`;
            document.querySelector("#tasks").appendChild(el);
          }
          const el = document.createElement("div");
          el.classList.add("grouping-div");
          el.id = `group-null`;
          el.innerHTML += `<h4>Other</h4><hr><div class="tasks"></div>`;
          document.querySelector("#tasks").appendChild(el);
        }
        break;
      default:
        break;
    }
  }

  for (const [id, { task, fingerprint }] of newTasksMap.entries()) {
    if ((TasksMap.has(id) && TasksMap.get(id).fingerprint == fingerprint) || !checkFilter(task, activeFilters)) continue;

    const newTaskClone = taskTemplate.content.cloneNode(true);

    newTaskClone.querySelector(".task").id = `task-${task.id}`;
    newTaskClone.querySelector(".task-title").innerHTML = task.title;

    if (task.state) {
      newTaskClone.querySelector(".task").style.backgroundColor = task.state.colour_background;
      newTaskClone.querySelector(".task").style.color = task.state.colour_text;
    }

    task.tags.sort((a, b) => a.type - b.type);

    const taskTags = task.tags.map((tag) => {
      const tagEl = document.createElement("p");
      tagEl.classList.add("task-tag");
      tagEl.style.backgroundColor = tag.colour_background;
      tagEl.style.color = tag.colour_text;
      tagEl.style.border = `${tag.colour_text} 1px solid`;
      tagEl.title = tag.description;

      const tagIcon =
        document.querySelector(`#preloaded-stuff object[data="${TagIconsMap[tag.type]}"]`)?.contentDocument?.cloneNode(true)?.children[0] ||
        [document.createElement("div")]
          .map((d) => {
            d.innerHTML = TagIcons[tag.type];
            return d;
          })[0]
          .querySelector("object");

      tagIcon.style.height = "18px";
      tagIcon.style.width = "18px";
      tagIcon.style.display = "inline-block";
      tagIcon.style.color = tag.colour_text;
      tagIcon.style.backgroundColor = tag.colour_background;

      tagEl.appendChild(tagIcon);

      const tagName = document.createElement("b");
      tagName.innerHTML = tag.name;
      tagEl.appendChild(tagName);

      newTaskClone.querySelector(".task-tags").appendChild(tagEl);
    });

    newTaskClone.querySelector(".task").addEventListener("click", async (ev) => {
      manageTaskPopup(group_id, task.id);
    });

    if (TasksMap.has(id) && TasksMap.get(id).fingerprint != fingerprint) {
      switch (groupingEl?.value) {
        case "state-grouping-asc":
        case "state-grouping-dec":
          tasksContainer.querySelector(`#task-${id}`).remove();
          document.querySelector(`#tasks #group-${task.state?.name?.replace(/ /g, "-") || "null"} .tasks`)?.appendChild(newTaskClone);
          break;
        default:
          tasksContainer.querySelector(`#task-${id}`).replaceWith(newTaskClone);
          break;
      }
    } else {
      switch (groupingEl?.value) {
        case "state-grouping-asc":
        case "state-grouping-dec":
          document.querySelector(`#tasks #group-${task.state?.name?.replace(/ /g, "-") || "null"} .tasks`)?.appendChild(newTaskClone);
          break;
        default:
          tasksContainer.appendChild(newTaskClone);
          break;
      }
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
