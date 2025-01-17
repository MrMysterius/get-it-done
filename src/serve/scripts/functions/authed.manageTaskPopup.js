import { Popup } from "./createPopup.js";
import { createNotice } from "./createNotice.js";
import { request } from "./request.js";
import { setUrlParam } from "./authed.urlData.js";
import { task_handler } from "../authed.tasks.js";

// import { showdown } from "../../libs/authed.showdown.min.js";

export async function manageTaskPopup(group_id, task_id) {
  const groupReq = request("GET", `/api/groups/${group_id}`);
  const taskReq = request("GET", `/api/groups/${group_id}/tasks/${task_id}`);
  const tagsReq = request("GET", `/api/groups/${group_id}/tags`);
  const stateReq = request("GET", `/api/groups/${group_id}/states`);

  const [group, task, tags, states] = await Promise.all([groupReq, taskReq, tagsReq, stateReq]);

  if (group?.status != 200 || task?.status != 200 || tags?.status != 200 || states?.status != 200) {
    console.log(group, task, tags);
    createNotice("Couldn't get task information", "error", 15000);
    setUrlParam("t");
    return;
  }

  const CurrentTags = new Set();

  task.data.tags.map((tag) => CurrentTags.add(tag.id));

  const converter = new showdown.Converter();
  const taskPopup = new Popup();

  converter.setOption("disableForced4SpacesIndentedSublists", true);
  converter.setOption("emoji", true);
  converter.setOption("encodeEmails", true);
  converter.setOption("openLinksInNewWindow", true);
  converter.setOption("requireSpaceBeforeHeadingText", true);
  converter.setOption("simpleLineBreaks", true);
  converter.setOption("simplifiedAutoLink", true);
  converter.setOption("splitAdjacentBlockquotes", true);
  converter.setOption("strikethrough", true);
  converter.setOption("tables", true);
  converter.setOption("tasklists", true);
  converter.setOption("underline", true);

  const wrapper = document.createElement("div");
  wrapper.innerHTML += `<h2 class="task-title-display" style="cursor: pointer; width: 300px; margin-top: 0;">${task.data.title}</h2><textarea class="task-title" type="text" placeholder="Task Title..." style="display: none; width: 300px;">${task.data.title}</textarea><hr>`;

  wrapper.innerHTML += `<div><div class="task-description-display" style="display: block; width: 300px; cursor: pointer;">Description:\n${converter.makeHtml(
    task.data.description || ""
  )}</div><textarea class="task-description" type="text" placeholder="Task Description..." style="display: none; width: 300px;">${
    task.data.description || ""
  }</textarea></div><hr>`;

  wrapper.innerHTML += `<div><div class="task-tags-display" style="display: flex; flex-direction: row; gap: 0.1em; max-width: 300px; flex-wrap: wrap;"></div><br><select class="task-tags-selection"><option>Add Tag</option></select></div>`;
  wrapper.innerHTML += `<hr>`;
  wrapper.innerHTML += `<div><select class="task-state"></select></div>`;

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
  // TASK STATE
  const taskStateSelection = wrapper.querySelector(".task-state");
  taskStateSelection.innerHTML = task.data.state
    ? `<option value="${task.data.state.id}" style="background-color: ${task.data.state.colour_background}; color: ${task.data.state.colour_text}" title="${task.data.state.description}">${task.data.state.name}</option>`
    : `<option value="null">No State</option>`;
  for (const state of states.data) {
    if (state.id == task.data.state?.id) continue;
    taskStateSelection.innerHTML += `<option value="${state.id}" style="background-color: ${state.colour_background}; color: ${state.colour_text}" title="${state.description}">${state.name}</option>`;
  }
  taskStateSelection.addEventListener("change", async () => {
    if (!taskStateSelection.value) return;
    taskStateSelection.setAttribute("disabled", "");

    const res = await request("POST", `/api/groups/${group_id}/tasks/${task_id}/state/${taskStateSelection.value}`);
    if (res?.status != 200) {
      console.log(res);
      createNotice("Couldn't change state of task", "error", 15000);
      taskStateSelection.innerHTML = task.data.state
        ? `<option value="${task.data.state.id}" style="background-color: ${task.data.state.colour_background}; color: ${task.data.state.colour_text}" title="${task.data.state.description}">${task.data.state.name}</option>`
        : `<option value="null">No State</option>`;
      for (const state of states.data) {
        if (state.id == task.data.state?.id) continue;
        taskStateSelection.innerHTML += `<option value="${state.id}" style="background-color: ${state.colour_background}; color: ${state.colour_text}" title="${state.description}">${state.name}</option>`;
      }
      taskStateSelection.removeAttribute("disabled");
      return;
    }

    createNotice("Changed Status of task", "success", 5000);
    taskStateSelection.removeAttribute("disabled");
    await manageTaskPopup(group_id, task_id);
    taskPopup.destroy("finnished");
    return;
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
    task_handler.populate();
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
    task_handler.populate();
    taskPopup.destroy("deleted");
  });

  taskPopup.addDestructionListener(() => {
    setUrlParam("t");
    task_handler.populate();
  });

  setUrlParam("t", task_id);
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
