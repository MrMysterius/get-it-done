import { getUrlParam, setUrlParam } from "./authed.urlData.js";

import { createNewGroup } from "./authed.createNewGroup.js";

export function switchGroup(group_id = null) {
  const current_group_id = getUrlParam("g");

  const new_group_id = group_id || document.querySelector("#group-selection")?.value || null;

  if (current_group_id == new_group_id) return false;
  if (new_group_id == "new") {
    createNewGroup();
    return false;
  }

  setUrlParam("g", new_group_id);
  return true;
}
