import { getUrlParam, setUrlParam } from "./authed.urlData.js";

import { createNotice } from "./createNotice.js";
import { request } from "./request.js";

export async function checkGroup(selectFirst = true) {
  const group_id = getUrlParam("g");
  const groups = await request("GET", "/api/groups");
  if (!groups || groups.status != 200) {
    createNotice("Couldn't get groups");
    return false;
  }

  const existing_group = groups.data.sort((a, b) => a.id - b.id).find((group) => group.group_id == group_id);

  if (selectFirst && !existing_group) {
    setUrlParam("g", groups.data[0]?.group_id || null);
    return true;
  }

  return true;
}
