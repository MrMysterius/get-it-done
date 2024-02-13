import { createNotice } from "./createNotice.js";
import { getUrlParam } from "./authed.urlData.js";
import { request } from "./request.js";

export async function createNewTask() {
  const group_id = getUrlParam("g");
  const titleEl = document.querySelector("#task-new-title");
  const title = titleEl?.value || null;
  if (!title) return false;

  let filters = await request("GET", `/api/groups/${group_id}/filters`);
  if (!filters || filters.status != 200) {
    filters = { data: [] };
  }
  const filter = filters.data.find((f) => f.id == getUrlParam("f"));

  const res = await request("POST", `/api/groups/${group_id}/tasks`, {
    title,
  });

  if (!res || res.status != 200) {
    createNotice("Couldn't create new Task", "error", 30000);
    return false;
  }

  if (filter)
    await request("POST", `/api/groups/${group_id}/tasks/${res.data.task_id}/tags`, {
      tags: filter.filter_data.tags.map((t) => {
        const el = document.createElement("textarea");
        el.innerHTML = t;
        return el.value;
      }),
    });

  titleEl.value = "";

  createNotice("Task Created", "success", 5000);
  return true;
}
