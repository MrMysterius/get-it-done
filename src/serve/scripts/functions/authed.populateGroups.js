import { createNotice } from "./createNotice.js";
import { getUrlParam } from "./authed.urlData.js";
import { request } from "./authed.request.js";

export async function populateGroups() {
  const groupSelector = document.querySelector("#group-selection");
  const group_id = getUrlParam("g");

  let options = "";

  const groups = await request("GET", "/api/groups");
  if (!groups || groups.status != 200) {
    createNotice("Couldn't get Groups", "error");
    return false;
  }

  const current_group = groups.data.sort((a, b) => a.id - b.id).find((group) => group.id == group_id);

  if (current_group) {
    options += `<option value="${current_group.group_id}">${current_group.group_name}</option>`;
  }

  for (const group of groups.data) {
    if (group.id === group_id) continue;
    options += `<option value="${group.group_id}">${group.group_name}</option>`;
  }

  options += `<option value="new">Create New Group</option>`;

  groupSelector.innerHTML = options;

  return true;
}
