import { Popup } from "./createPopup.js";
import { createNotice } from "./createNotice.js";
import { populateTasks } from "./authed.populateTasks.js";
import { request } from "./request.js";

// import { showdown } from "../../libs/authed.showdown.min.js";

export async function manageTaskPopup(group_id, task_id) {
  const group = await request("GET", `/api/groups/${group_id}`);
  const task = await request("GET", `/api/groups/${group_id}/tasks/${task_id}`);
  const tags = await request("GET", `/api/groups/${group_id}/tags`);

  if (!group || group.status != 200 || !task || task.status != 200 || !tags || tags.status != 200) {
    createNotice("Couldn't get task information", "error", 15000);
    return;
  }

  const CurrentTags = new Set();

  task.data.tags.map((tag) => CurrentTags.add(tag.id));

  const converter = new showdown.Converter();
  const taskPopup = new Popup();

  const wrapper = document.createElement("div");
  wrapper.innerHTML += `<h2 class="task-title-display" style="cursor: pointer; width: 300px; margin-top: 0;">${task.data.title}</h2><textarea class="task-title" type="text" placeholder="Task Title..." style="display: none; width: 300px;">${task.data.title}</textarea><hr>`;

  wrapper.innerHTML += `<div><div class="task-description-display" style="display: block; width: 300px; cursor: pointer;">Description:\n${converter.makeHtml(
    task.data.description || ""
  )}</div><textarea class="task-description" type="text" placeholder="Task Description..." style="display: none; width: 300px;">${
    task.data.description || ""
  }</textarea></div><hr>`;

  wrapper.innerHTML += `<div><div class="task-tags-display" style="display: flex; flex-direction: row; gap: 0.1em; max-width: 300px; flex-wrap: wrap;"></div><br><select class="task-tags-selection"><option>Add Tag</option></select></div>`;

  let form = "<br><br><br><form><table>";
  form += `</table><button class="delete" style="background-color: var(--notice-error); color: var(--notice-error-text);">DELETE</button> <button class="archive" style="background-color: var(--notice-warn); color: var(--notice-warn-text);">ARCHIVE</button> <button class="cancel">CANCEL</button></form>`;

  wrapper.innerHTML += form;

  //
  // TITLE EDITING
  const titleEl = wrapper.querySelector(".task-title-display");
  const titleInput = wrapper.querySelector(".task-title");
  titleEl.addEventListener("click", (ev) => {
    titleInput.style.height = titleEl.clientHeight.toString() + "px";
    titleEl.style.display = "none";
    titleInput.style.fontSize = getComputedStyle(titleEl).fontSize;
    titleInput.style.display = "unset";
    titleInput.focus();
    titleInput.selectionStart = titleInput.value.length;
    titleInput.selectionEnd = titleInput.value.length;
  });
  titleInput.addEventListener("focusout", async (ev) => {
    const inputValue = titleInput.value;
    const res = await request("PUT", `/api/groups/${group_id}/tasks/${task_id}`, { task_title: inputValue });
    if (!res || res.status != 200) {
      console.log(res);
      createNotice("Couldn't update Task title", "error", 10000);
      titleInput.focus();
      return;
    }

    createNotice("Updated Task title", "success", 5000);
    titleEl.textContent = inputValue;
    titleEl.style.display = "block";
    titleInput.style.display = "none";
  });
  titleInput.addEventListener("keypress", (ev) => {
    if (ev.key == "Enter") {
      titleInput.blur();
    }
  });

  //
  // DESCRIPTION EDITING
  const descriptionEl = wrapper.querySelector(".task-description-display");
  const descriptionInput = wrapper.querySelector(".task-description");
  descriptionEl.addEventListener("click", (ev) => {
    descriptionInput.style.height = descriptionEl.clientHeight.toString() + "px";
    descriptionEl.style.display = "none";
    descriptionInput.style.display = "unset";
    descriptionInput.focus();
    descriptionInput.selectionStart = descriptionInput.value.length;
    descriptionInput.selectionEnd = descriptionInput.value.length;
  });
  descriptionInput.addEventListener("focusout", async (ev) => {
    const inputValue = descriptionInput.value;
    const res = await request("PUT", `/api/groups/${group_id}/tasks/${task_id}`, { task_description: inputValue });
    if (!res || res.status != 200) {
      console.log(res);
      createNotice("Couldn't update Task description", "error", 10000);
      descriptionInput.focus();
      return;
    }

    createNotice("Task description updated", "success", 5000);
    descriptionEl.innerHTML = `Description:\n${converter.makeHtml(inputValue)}`;
    descriptionEl.style.display = "block";
    descriptionInput.style.display = "none";
  });
  descriptionInput.addEventListener("keypress", (ev) => {
    if (ev.key == "Enter" && !ev.shiftKey) {
      descriptionInput.blur();
    }
  });

  //
  // TAGS EDITING
  const tagsDisplay = wrapper.querySelector(".task-tags-display");
  const tagsSelection = wrapper.querySelector(".task-tags-selection");
  tagsDisplay.innerHTML = generateCurrentTagsList(tags.data.filter((tag) => CurrentTags.has(tag.id)));
  tagsSelection.innerHTML = generateTagsSelection(tags.data.filter((tag) => !CurrentTags.has(tag.id)));
  applyClickableRemove(tagsDisplay, group_id, task_id, taskPopup);
  tagsSelection.addEventListener("change", async (ev) => {
    tagsSelection.setAttribute("disabled", "");
    if (!tagsSelection.value) {
      tagsSelection.innerHTML = generateTagsSelection(tags.data.filter((tag) => !CurrentTags.has(tag.id)));
      tagsSelection.removeAttribute("disabled");
      return;
    }

    const res = await request("POST", `/api/groups/${group_id}/tasks/${task_id}/tags`, {
      tags: [tagsSelection.value],
    });

    if (!res || res.status != 200) {
      console.log(res);
      createNotice("Couldn't add Tag to Task", "error", 15000);
      tagsSelection.innerHTML = generateTagsSelection(tags.data.filter((tag) => !CurrentTags.has(tag.id)));
      tagsSelection.removeAttribute("disabled");
      return;
    }

    const task = await request("GET", `/api/groups/${group_id}/tasks/${task_id}`);
    if (!task || task.status != 200) {
      createNotice("Couldn't update Task Popup", "error", 15000);
      taskPopup.destroy();
      return;
    }

    CurrentTags.clear();
    task.data.tags.map((tag) => CurrentTags.add(tag.id));

    createNotice("Added Tag to Task", "success", 5000);
    tagsDisplay.innerHTML = generateCurrentTagsList(tags.data.filter((tag) => CurrentTags.has(tag.id)));
    tagsSelection.innerHTML = generateTagsSelection(tags.data.filter((tag) => !CurrentTags.has(tag.id)));
    applyClickableRemove(tagsDisplay, group_id, task_id, taskPopup);
    tagsSelection.removeAttribute("disabled");
  });

  //
  // FORM BUTTONS
  wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
    ev.preventDefault();
    taskPopup.destroy("canceled");
  });
  wrapper.querySelector(".archive").addEventListener("click", async (ev) => {
    ev.preventDefault();
    const res = await request("PUT", `/api/groups/${group_id}/tasks/${task_id}`, {
      isArchived: 1,
    });
    if (!res || res.status != 200) {
      createNotice("Couldn't archive Task", "error", 15000);
      return;
    }
    createNotice("Archived Task", "success", 5000);
    populateTasks();
    taskPopup.destroy("archived");
  });
  wrapper.querySelector(".delete").addEventListener("click", async (ev) => {
    ev.preventDefault();
    const res = await request("DELETE", `/api/groups/${group_id}/tasks/${task_id}`);
    if (!res || res.status != 200) {
      createNotice("Couldn't delete Task", "error", 15000);
      return;
    }
    createNotice("Deleted Task", "success", 5000);
    populateTasks();
    taskPopup.destroy("deleted");
  });

  taskPopup.addDestructionListener(() => {
    populateTasks();
  });

  taskPopup.appendContentNodes([wrapper]);
  taskPopup.spawn();
}

export function generateCurrentTagsList(tags) {
  let out = "";
  for (const tag of tags) {
    out += `<div style="display: inline; border-radius: 10px; padding: 0.2em 0.5em 0.2em 0.5em; background-color: ${tag.colour_background}; color: ${tag.colour_text}" title="${tag.description}">${tag.name}</div>`;
  }
  return out;
}

export function generateTagsSelection(tags) {
  let out = "<option>Add Tag</option>";
  for (const tag of tags) {
    out += `<option value="${tag.name}" style="background-color: ${tag.colour_background}; color: ${tag.colour_text}">${tag.name}</option>`;
  }
  return out;
}

export function applyClickableRemove(el, group_id, task_id, popup) {
  for (const div of el.querySelectorAll("div")) {
    div.style.cursor = "pointer";
    div.addEventListener("click", async (ev) => {
      const res = await request("DELETE", `/api/groups/${group_id}/tasks/${task_id}/tags`, {
        tags: [div.textContent],
      });
      if (!res || res.status != 200) {
        createNotice("Couldn't remove Tag from Task", "error", 15000);
        return;
      }

      createNotice("Removed Tag from Task", "success", 5000);
      div.remove();
      await manageTaskPopup(group_id, task_id);
      popup.destroy();
      return;
    });
  }
}
