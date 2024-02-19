import { getUrlParam, setUrlParam } from "./authed.urlData.js";

import { createNotice } from "./createNotice.js";
import { request } from "./request.js";
import { task_handler } from "../authed.tasks.js";

export async function populateFilters() {
  const group_id = getUrlParam("g");
  const activeFilters = getUrlParam("f")?.split(",") || [];

  if (!group_id) {
    createNotice("Couldn't get Filters", "error", 15000);
    return;
  }

  const filters = await request("GET", `/api/groups/${group_id}/filters`);
  if (!filters || filters.status != 200) {
    console.log(filters);
    createNotice("Couldn't get Filters", "error", 15000);
    return;
  }

  const filterList = document.querySelector("#sidebar-menu .filters .filter-list");
  if (!filterList) {
    createNotice("Couldn't get Filters", "error", 15000);
    return;
  }

  const filterElements = [];
  for (const filter of filters.data) {
    const filterEl = document.createElement("div");
    filterEl.classList.add("filter");
    if (activeFilters.find((a) => a == filter.id)) {
      filterEl.classList.add("selected");
    }
    filterEl.innerHTML = `<b>${filter.name}</b> <button class="filter-select" style="background-color: var(--notice-warn); color: var(--notice-warn-text)">SELECT</button> <button class="filter-delete" style="background-color: var(--notice-error)">DELETE</button>`;

    if (!activeFilters.find((a) => a == filter.id))
      filterEl.querySelector(".filter-select").addEventListener("click", () => {
        const currentFilters = getUrlParam("f")?.split(",") || [];
        currentFilters.push(filter.id);
        setUrlParam("f", currentFilters.join(","));
        populateFilters();
        task_handler.populate();
      });
    else filterEl.querySelector(".filter-select").remove();

    filterEl.querySelector(".filter-delete").addEventListener("click", async () => {
      const res = await request("DELETE", `/api/groups/${group_id}/filters/${filter.id}`);
      if (!res || res.status != 200) {
        createNotice("Couldn't delete Filter", "error", 15000);
        return;
      }

      createNotice("Deleted Filter", "success", 5000);
      populateFilters();
      task_handler.populate();
    });

    filterElements.push(filterEl);
  }

  for (const child of Array.from(filterList.children)) {
    child.remove();
  }
  filterElements.map((el) => filterList.appendChild(el));
}
