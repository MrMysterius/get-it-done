import { createNotice } from "./createNotice.js";
import { getUrlParam } from "./authed.urlData.js";
import { request } from "./authed.request.js";

export async function createNewTask() {
  const titleEl = document.querySelector("#task-new-title");
  const title = titleEl?.value || null;
  if (!title) return false;

  const res = await request("POST", `/api/groups/${getUrlParam("g")}/tasks`, {
    title,
  });

  if (!res || res.status != 200) {
    createNotice("Couldn't create new Task", "error", 30000);
    return false;
  }

  titleEl.value = "";

  createNotice("Task Created", "success", 5000);
  return true;
}
