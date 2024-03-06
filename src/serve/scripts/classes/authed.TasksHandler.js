import { RequestHandler } from "./authed.RequestHandler.js";
import { createNotice } from "../functions/createNotice.js";
import { getUrlParam } from "../functions/authed.urlData.js";
import { manageTaskPopup } from "../functions/authed.manageTaskPopup.js";

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

export class TasksHandler {
  Requests = new RequestHandler();
  Tasks = new Map();
  isPopulating = false;

  constructor() {
    this.TasksEl = document.querySelector("#tasks");
    this.setRequests();
  }

  setRequests() {
    const group_id = getUrlParam("g");

    this.Requests = new RequestHandler();
    this.Requests.prepareRequest("tasks", {
      method: "GET",
      url: `/api/groups/${group_id}/tasks`,
    });
    this.Requests.prepareRequest("filters", {
      method: "GET",
      url: `/api/groups/${group_id}/filters`,
    });
    this.Requests.prepareRequest("states", {
      method: "GET",
      url: `/api/groups/${group_id}/states`,
    });
  }

  async populate(forceFullClear = false) {
    if (this.isPopulating) {
      setTimeout(this.populate, 100, forceFullClear);
      return;
    }
    this.isPopulating = true;
    this.setRequests();
    this.Requests.reset();
    await this.Requests.makeRequest();

    if (!this.Requests.checkStatusAll(200)) {
      console.error(this.Requests);
      createNotice("Couldn't populate Tasks", "error", 10000);
      return false;
    }

    const currentFiltersList = getUrlParam("f")?.split(",") || [];
    const filters = this.Requests.getData("filters")?.filter((filter) => currentFiltersList.find((cf) => cf == filter.id)) || [];

    const NewTasks = new Map();
    for (const task of this.Requests.getData("tasks").sort(this.getSorter())) {
      NewTasks.set(task.id, { task, fingerprint: btoa(encodeURI(JSON.stringify(task))) });
    }

    if (forceFullClear) {
      this.fullClear();
      this.populateGroupings();
    }

    this.clearRemovedTasks(NewTasks, filters);
    this.updateTasks(NewTasks, filters);

    this.isPopulating = false;
    return true;
  }

  fullClear() {
    for (const id of this.Tasks.keys()) {
      this.TasksEl.querySelector(`#task-${id}`)?.remove();
    }
    for (const el of Array.from(this.TasksEl.querySelectorAll(".grouping-div"))) {
      el.remove();
    }
    this.Tasks.clear();
  }

  populateGroupings() {
    switch (this.TasksEl.querySelector(`.quick-filters-container .quick-filter-grouping`)?.value) {
      case "state-grouping-asc":
        this.groupingByState({ sorter: (a, b) => a.localeCompare(b) });
        break;
      case "state-grouping-dec":
        this.groupingByState({ sorter: (a, b) => b.localeCompare(a) });
        break;
      default:
        break;
    }
  }
  groupingByState({
    filter = () => {
      return true;
    },
    sorter = () => {
      return true;
    },
  }) {
    const states = this.Requests.getData("states")
      .map((s) => s.name)
      .filter(filter)
      .sort(sorter);
    for (const state of states) {
      const GroupingsDiv = document.createElement("div");

      GroupingsDiv.classList.add("grouping-div");
      GroupingsDiv.id = `group-${state.replace(/\s/g, "-")}`;

      GroupingsDiv.innerHTML += `<details open class="grouping-details"><summary><h4>${state}</h4><hr></summary><div class="tasks"></div></details>`;

      this.TasksEl.appendChild(GroupingsDiv);
    }

    const GroupingsDiv = document.createElement("div");

    GroupingsDiv.classList.add("grouping-div");
    GroupingsDiv.id = `group-no-state`;

    GroupingsDiv.innerHTML += `<details open class="grouping-details"><summary><h4>No State</h4><hr></summary><div class="tasks"></div></details>`;

    this.TasksEl.appendChild(GroupingsDiv);
  }

  clearRemovedTasks(NewTasks, filters) {
    for (const [id, { task }] of this.Tasks.entries()) {
      if (NewTasks.has(id) && this.checkFilter(task, filters)) continue;

      const taskEl = this.TasksEl.querySelector(`#task-${id}`);
      if (!taskEl) continue;

      taskEl.classList.add("TaskPopout");
      this.Tasks.delete(id);

      setTimeout(() => {
        taskEl.remove();
      }, 2000);
    }
  }

  updateTasks(NewTasks, filters) {
    const group_id = getUrlParam("g");
    const taskTemplate = document.querySelector("#template-task");

    const NewTasksArray = Array.from(NewTasks.entries());

    for (let i = 0; i < NewTasksArray.length; i++) {
      // for (const [id, { task, fingerprint }] of NewTasksArray) {
      const [id, { task, fingerprint }] = NewTasksArray[i];
      if ((this.Tasks.has(id) && this.Tasks.get(id).fingerprint == fingerprint) || !this.checkFilter(task, filters)) continue;

      const TaskElementClone = taskTemplate.content.cloneNode(true);

      TaskElementClone.querySelector(".task").id = `task-${task.id}`;
      TaskElementClone.querySelector(".task-title").innerHTML = task.title;

      if (task.state) {
        TaskElementClone.querySelector(".task").style.backgroundColor = task.state.colour_background;
        TaskElementClone.querySelector(".task").style.color = task.state.colour_text;
      }

      task.tags.sort((a, b) => a.type - b.type);

      for (const tag of task.tags) {
        const tagEl = document.createElement("p");
        tagEl.classList.add("task-tag");
        if (localStorage.getItem("task-tags-collapsed")) tagEl.classList.add("collapsed");
        else tagEl.classList.add("expanded");
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
        tagIcon.classList.add("tag-icon");

        tagEl.appendChild(tagIcon);

        const tagName = document.createElement("b");
        tagName.innerHTML = tag.name;
        tagName.classList.add("tag-name");
        tagEl.appendChild(tagName);

        const tagBullet = document.createElement("d");
        tagBullet.style.borderColor = tag.colour_text;
        tagBullet.style.backgroundColor = tag.colour_text;
        tagBullet.classList.add("tag-bullet");
        tagEl.appendChild(tagBullet);

        tagEl.addEventListener("click", (el) => {
          el.preventDefault();
          const task_tags = Array.from(document.querySelectorAll(".task-tag"));
          if (task_tags[0].classList.contains("collapsed")) {
            localStorage.setItem("task-tags-collapsed", false);
            for (let task_tag of task_tags) {
              task_tag.classList.remove("collapsed");
              task_tag.classList.add("expanded");
            }
          } else {
            localStorage.setItem("task-tags-collapsed", true);
            for (let task_tag of task_tags) {
              task_tag.classList.remove("expanded");
              task_tag.classList.add("collapsed");
            }
          }
        });

        TaskElementClone.querySelector(".task-tags").appendChild(tagEl);
      }

      TaskElementClone.querySelector(".task").addEventListener("click", async (ev) => {
        const blackList = ["task-tag", "tag-icon", "tag-name", "tag-bullet"];
        if (Array.from(ev?.srcElement?.classList?.values() || []).find((cName) => blackList.includes(cName))) return;
        manageTaskPopup(group_id, task.id);
      });

      if (this.Tasks.has(id) && this.Tasks.get(id).fingerprint != fingerprint) {
        switch (this.TasksEl.querySelector(`.quick-filters-container .quick-filter-grouping`)?.value) {
          case "state-grouping-asc":
          case "state-grouping-dec":
            if (this.Tasks.get(id).state == task.state) this.TasksEl.querySelector(`#task-${id}`).replaceWith(TaskElementClone);

            this.TasksEl.querySelector(`#task-${id}`).remove();

            const querySelectorBefore = `#task-${
              NewTasksArray[i + 1 + NewTasksArray.slice(i + 1).findIndex((t) => t[1].task.state?.name == task.state?.name)]?.[0]
            }`;
            this.sortedInsert(
              this.TasksEl.querySelector(`#group-${task.state?.name?.replace(/ /g, "-") || "no-state"} .tasks`),
              querySelectorBefore,
              TaskElementClone
            );
            break;
          default:
            this.TasksEl.querySelector(`#task-${id}`).replaceWith(TaskElementClone);
            break;
        }
      } else {
        switch (this.TasksEl.querySelector(`.quick-filters-container .quick-filter-grouping`)?.value) {
          case "state-grouping-asc":
          case "state-grouping-dec":
            this.sortedInsert(
              this.TasksEl.querySelector(`#group-${task.state?.name?.replace(/ /g, "-") || "no-state"} .tasks`),
              `#task-${NewTasksArray[i + 1]?.[0]}`,
              TaskElementClone
            );
            break;
          default:
            this.sortedInsert(this.TasksEl, `#task-${NewTasksArray[i + 1]?.[0]}`, TaskElementClone);
            break;
        }
      }

      this.Tasks.set(id, { task, fingerprint });
    }
  }

  sortedInsert(onElement, beforeQuerySelector, newElement) {
    const beforeElemenet = onElement.querySelector(beforeQuerySelector);
    if (beforeElemenet) {
      onElement.insertBefore(newElement, beforeElemenet);
    } else {
      onElement.appendChild(newElement);
    }
  }

  getSorter() {
    const sortValue = this.TasksEl.querySelector(".quick-filters-container .quick-filter-sorting")?.value || null;
    switch (sortValue) {
      case "creation-sort-asc":
        return (a, b) => a.id - b.id;
      case "creation-sort-dec":
        return (a, b) => b.id - a.id;
      default:
        return () => 0;
    }
  }

  checkFilter(task, filters) {
    if (!filters || filters.length == 0) return true;
    for (const filter of filters) {
      for (const ftag of filter.filter_data.tags) {
        if (task.tags.find((tag) => ftag == tag.name)) continue;
        return false;
      }
    }
    return true;
  }
}
