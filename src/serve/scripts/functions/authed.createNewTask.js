import { createNotice } from "./createNotice.js";
import { getUrlParam } from "./authed.urlData.js";
import { request } from "./request.js";

export async function createNewTask() {
  const group_id = getUrlParam("g");
  const titleEl = document.querySelector("#task-new-title");
  const title = titleEl?.value || null;
  if (!title) return false;

  const filtersReq = request("GET", `/api/groups/${group_id}/filters`);
  const res = await request("POST", `/api/groups/${group_id}/tasks`, {
    title,
  });

  if (res?.status != 200) {
    createNotice("Couldn't create new Task", "error", 30000);
    return false;
  }

  let filters = await filtersReq;
  if (filters?.status != 200) {
    filters = [];
  }

  const currentFiltersList = getUrlParam("f")?.split(",") || [];
  const activeFilters = filters.data.filter((filter) => currentFiltersList.find((cf) => cf == filter.id));

  if (activeFilters.length > 0)
    await Promise.all(
      activeFilters.map((filter) =>
        request("POST", `/api/groups/${group_id}/tasks/${res.data.task_id}/tags`, {
          tags: filter.filter_data.tags.map((t) => {
            const el = document.createElement("textarea");
            el.innerHTML = t;
            return el.value;
          }),
        })
      )
    );

  titleEl.value = "";

  createNotice("Task Created", "success", 5000);
  return true;
}
