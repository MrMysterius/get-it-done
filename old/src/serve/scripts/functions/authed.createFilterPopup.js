import { Popup } from "./createPopup.js";
import { createNotice } from "./createNotice.js";
import { populateFilters } from "./authed.populateFilters.js";
import { request } from "./request.js";

export async function createFilterPopup(group_id) {
  const groupReq = request("GET", `/api/groups/${group_id}`);
  const tagsReq = request("GET", `/api/groups/${group_id}/tags`);

  const [group, tags] = await Promise.all([groupReq, tagsReq]);

  if (group?.status != 200 || tags?.status != 200) {
    createNotice("Couldn't open Filter Creation", "error", 15000);
    return;
  }

  const filterPopup = new Popup();
  const content = document.createElement("div");

  let form = `<form>`;

  form += `<div><b>Filter Name:</b> <input name="name" type="text" class="filter-name" placehole="Filter Name" required></div>`;
  form += `<b>Tags:</b><br><fieldset class="filter-tags" style="display: flex; flex-direction: column; gap: 0.5em;"></fieldset>`;
  form += `<div><button type="submit" style="background-color: var(--notice-success); color: var(--notice-success-text)">CREATE</button></div>`;

  form += `</form>`;

  content.innerHTML += form;

  const tagsFieldset = content.querySelector(".filter-tags");
  for (const tag of tags.data) {
    tagsFieldset.innerHTML += `<div><input type="checkbox" name="tags" value="${tag.name}" id="filtertag-${tag.id}"><label for="filtertag-${tag.id}" style="background-color: ${tag.colour_background}; color: ${tag.colour_text}; border-radius: 10px; padding: 0.2em 0.5em 0.2em 0.5em;">${tag.name}</label><br></div>`;
  }

  const submitForm = content.querySelector("form");
  submitForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const form_data = new FormData(submitForm);

    const res = await request("POST", `/api/groups/${group_id}/filters`, {
      name: form_data.get("name"),
      filter: {
        tags: Array.from(form_data.getAll("tags")),
      },
    });
    if (!res || res.status != 200) {
      console.log(res, {
        name: form_data.get("name"),
        filter: {
          tags: Array.from(form_data.getAll("tags")),
        },
      });
      createNotice("Couldn't create Filter", "error", 15000);
      return;
    }

    createNotice("Created Filter", "success", 5000);
    populateFilters();
    filterPopup.destroy();
  });

  filterPopup.appendContentNodes([content]);
  filterPopup.spawn();
}
