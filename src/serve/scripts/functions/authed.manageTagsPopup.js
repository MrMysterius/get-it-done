import { Popup } from "./createPopup.js";
import { createNotice } from "./createNotice.js";
import { request } from "./request.js";

export async function manageTagsPopup(group_id) {
  const tagsPopup = new Popup();

  const content = document.createElement("div");

  const groupReq = await request("GET", `/api/groups/${group_id}`);
  const tagsReq = await request("GET", `/api/groups/${group_id}/tags`);

  const [group, tags] = await Promise.all([groupReq, tagsReq]);

  if (group?.status != 200 || tags?.status != 200) {
    createNotice("Couldn't get group or tags information", "error", 15000);
    return;
  }

  content.innerHTML += `<h3>Tags - ${group.data.group_name}</h3>`;

  content.innerHTML += `<button class="tags-create-new" style="background-color: var(--notice-success); color: black;">CREATE NEW TAG</button><hr><br>`;

  const contextTags = document.createElement("div");
  contextTags.innerHTML += `<b>Context Tags:</b><br>`;
  contextTags.appendChild(
    generateTagsTable(
      group_id,
      tags.data.filter((tag) => tag.type == "context"),
      tagsPopup
    )
  );
  contextTags.appendChild(document.createElement("hr"));

  const projectTags = document.createElement("div");
  projectTags.innerHTML += `<b>Project Tags:</b><br>`;
  projectTags.appendChild(
    generateTagsTable(
      group_id,
      tags.data.filter((tag) => tag.type == "project"),
      tagsPopup
    )
  );
  projectTags.appendChild(document.createElement("hr"));

  const otherTags = document.createElement("div");
  otherTags.innerHTML += `<b>Other Tags:</b><br>`;
  otherTags.appendChild(
    generateTagsTable(
      group_id,
      tags.data.filter((tag) => tag.type == "other"),
      tagsPopup
    )
  );
  otherTags.appendChild(document.createElement("hr"));

  content.appendChild(contextTags);
  content.appendChild(projectTags);
  content.appendChild(otherTags);

  content.querySelector(".tags-create-new").addEventListener("click", async () => {
    const res = await addTag(group_id);
    if (res) {
      await manageTagsPopup(group_id);
      tagsPopup.destroy();
    }
  });

  tagsPopup.appendContentNodes([content]);
  tagsPopup.spawn();
}

export function generateTagsTable(group_id, tags, popup = null) {
  const table = document.createElement("table");
  for (const tag of tags) {
    const row = document.createElement("tr");
    row.innerHTML += `<td class="tag-name" tag-id="${tag.id}" style="background-color: ${tag.colour_background}; color: ${tag.colour_text};">${tag.name}</td>`;
    row.innerHTML += `<td class="tag-description">${tag.description}</td>`;
    row.innerHTML += `<td class="tag-options"><button class="tag-edit" style="background-color: var(--notice-warn); color: var(--notice-warn-text)">EDIT</button> <button class="tag-delete" style="background-color: var(--notice-error)">DELETE</button></td>`;

    row.querySelector(".tag-edit").addEventListener("click", async () => {
      const res = await editTag(group_id, tag);
      if (res && popup) {
        await manageTagsPopup(group_id);
        popup.destroy();
      }
    });
    row.querySelector(".tag-delete").addEventListener("click", async () => {
      const res = await deleteTag(group_id, tag.id, tag.name);
      if (res && popup) {
        await manageTagsPopup(group_id);
        popup.destroy();
      }
    });

    table.appendChild(row);
  }

  return table;
}

export async function addTag(group_id) {
  return new Promise((resolve) => {
    const addPopup = new Popup();

    const wrapper = document.createElement("div");
    let content = "";
    content += `<h4>Add New Tag</h4><form><table>`;
    content += `<tr><td><b>Name:</b></td><td><input type="text" class="tag-name" minlength="1" maxlength="30" placeholder="Tag Name" required></td></tr>`;
    content += `<tr><td><b>Description:</b></td><td><textarea type="text" class="tag-description" maxlength="300" placeholder="Tag Description"></textarea></td></tr>`;
    content += `<tr><td><b>Type:</b></td><td><select class="tag-type"><option value="context">Context</option><option value="project">Project</option><option value="other">Other</option></select></td></tr>`;
    content += `<tr><td><b>Colour Text:</b></td><td><input type="text" class="tag-colour-txt" value="#000000" pattern="(^\#[0-9abcdefABCDEF]{6}$)|" placeholder="HEX Colour Code"><div class="tag-colour-txt-preview" style="min-height: 10px; min-width: 10px; background-color: #000000;"></div></td></tr>`;
    content += `<tr><td><b>Colour Background:</b></td><td><input type="text" class="tag-colour-bg" value="#66A3FF" pattern="(^\#[0-9abcdefABCDEF]{6}$)|" placeholder="HEX Colour Code"><div class="tag-colour-bg-preview" style="min-height: 10px; min-width: 10px; background-color: #66A3FF;"></div></td></tr>`;
    content += `</table><button type="submit" class="submit" style="background-color: var(--notice-success); color: black;">CREATE</button> <button class="cancel">CANCEL</button></form>`;
    wrapper.innerHTML += content;

    wrapper.querySelector(".tag-type").value = "other";

    wrapper.querySelector(".tag-colour-txt").addEventListener("keyup", () => {
      if (wrapper.querySelector(".tag-colour-txt").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".tag-colour-txt-preview").style.backgroundColor = wrapper.querySelector(".tag-colour-txt").value;
    });
    wrapper.querySelector(".tag-colour-bg").addEventListener("keyup", () => {
      if (wrapper.querySelector(".tag-colour-bg").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".tag-colour-bg-preview").style.backgroundColor = wrapper.querySelector(".tag-colour-bg").value;
    });

    wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
      ev.preventDefault();
      addPopup.destroy("cancel");
    });

    wrapper.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const name = wrapper.querySelector(".tag-name").value;
      const description = wrapper.querySelector(".tag-description").value;
      const type = wrapper.querySelector(".tag-type").value;
      const colour_text = wrapper.querySelector(".tag-colour-txt").value;
      const colour_background = wrapper.querySelector(".tag-colour-bg").value;

      const data = {
        name,
        description,
        type,
        colour_text,
        colour_background,
      };

      if ("" == name) delete data.name;
      if ("" == description || description == "") delete data.description;
      if ("" == colour_text) delete data.colour_text;
      if ("" == colour_background) delete data.colour_background;

      const res = await request("POST", `/api/groups/${group_id}/tags`, data);
      if (!res || res.status != 200) {
        console.log(res);
        addPopup.destroy("cancel");
        createNotice("Failed to create Tag", "error", 15000);
        return;
      }

      addPopup.destroy("finnished");
      createNotice("Successfully created Tag", "success", 5000);
      resolve(true);
      return;
    });

    addPopup.addDestructionListener((t) => {
      if (t == "cancel") resolve(false);
    });

    addPopup.appendContentNodes([wrapper]);
    addPopup.spawn();
  });
}

export async function editTag(group_id, tag) {
  return new Promise((resolve) => {
    const editPopup = new Popup();

    const wrapper = document.createElement("div");
    let content = "";
    content += `<h4>Editing - ${tag.name}</h4><form><table>`;
    content += `<tr><td><b>Name:</b></td><td><input type="text" class="tag-name" value="${tag.name}" minlength="1" maxlength="30" placeholder="Tag Name"></td></tr>`;
    content += `<tr><td><b>Description:</b></td><td><textarea type="text" class="tag-description" value="${tag.description}" maxlength="300" placeholder="Tag Description">${tag.description}</textarea></td></tr>`;
    content += `<tr><td><b>Type:</b></td><td><select class="tag-type" value="${tag.type}"><option value="context">Context</option><option value="project">Project</option><option value="other">Other</option></select></td></tr>`;
    content += `<tr><td><b>Colour Text:</b></td><td><input type="text" class="tag-colour-txt" value="${tag.colour_text}" pattern="^\#[0-9abcdefABCDEF]{6}$" placeholder="HEX Colour Code"><div class="tag-colour-txt-preview" style="min-height: 10px; min-width: 10px; background-color: ${tag.colour_text};"></div></td></tr>`;
    content += `<tr><td><b>Colour Background:</b></td><td><input type="text" class="tag-colour-bg" value="${tag.colour_background}" pattern="^\#[0-9abcdefABCDEF]{6}$" placeholder="HEX Colour Code"><div class="tag-colour-bg-preview" style="min-height: 10px; min-width: 10px; background-color: ${tag.colour_background};"></div></td></tr>`;
    content += `</table><button type="submit" class="submit" style="background-color: var(--notice-warn); color: black;">EDIT</button> <button class="cancel">CANCEL</button></form>`;
    wrapper.innerHTML += content;

    wrapper.querySelector(".tag-type").value = tag.type;

    wrapper.querySelector(".tag-colour-txt").addEventListener("keyup", () => {
      if (wrapper.querySelector(".tag-colour-txt").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".tag-colour-txt-preview").style.backgroundColor = wrapper.querySelector(".tag-colour-txt").value;
    });
    wrapper.querySelector(".tag-colour-bg").addEventListener("keyup", () => {
      if (wrapper.querySelector(".tag-colour-bg").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".tag-colour-bg-preview").style.backgroundColor = wrapper.querySelector(".tag-colour-bg").value;
    });

    wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
      ev.preventDefault();
      editPopup.destroy("cancel");
    });

    wrapper.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const name = wrapper.querySelector(".tag-name").value;
      const description = wrapper.querySelector(".tag-description").value;
      const type = wrapper.querySelector(".tag-type").value;
      const colour_text = wrapper.querySelector(".tag-colour-txt").value;
      const colour_background = wrapper.querySelector(".tag-colour-bg").value;

      const data = {
        name,
        description,
        type,
        colour_text,
        colour_background,
      };

      if (tag.name == name) delete data.name;
      if (tag.description == description || description == "") delete data.description;
      if (tag.type == type) delete data.type;
      if (tag.colour_text == colour_text) delete data.colour_text;
      if (tag.colour_background == colour_background) delete data.colour_background;

      const res = await request("PUT", `/api/groups/${group_id}/tags/${tag.id}`, data);
      if (!res || res.status != 200) {
        console.log(res);
        editPopup.destroy("cancel");
        createNotice("Failed to update Tag", "error", 15000);
        return;
      }

      editPopup.destroy("finnished");
      createNotice("Successfully edited Tag", "success", 5000);
      resolve(true);
      return;
    });

    editPopup.addDestructionListener((t) => {
      if (t == "cancel") resolve(false);
    });

    editPopup.appendContentNodes([wrapper]);
    editPopup.spawn();
  });
}

export async function deleteTag(group_id, tag_id, tag_name = "") {
  return new Promise((resolve) => {
    const confirmPopup = new Popup();

    const wrapper = document.createElement("div");
    wrapper.innerHTML += `<h4>Delete this Tag ${tag_name}?</h4>`;
    wrapper.innerHTML += `<button class="confirm" style="background-color: var(--notice-error)">CONFIRM</button> `;
    wrapper.innerHTML += `<button class="cancel">CANCEL</button>`;

    wrapper.querySelector(".confirm").addEventListener("click", async () => {
      const res = await request("DELETE", `/api/groups/${group_id}/tags/${tag_id}`);
      if (!res || res.status != 200) {
        confirmPopup.destroy("cancel");
        console.log(res);
        createNotice("Failed to delete Tag", "error", 15000);
        return;
      }

      confirmPopup.destroy("finnished");
      createNotice("Successfully deleted Tag", "success", 5000);
      resolve(true);
      return;
    });
    wrapper.querySelector(".cancel").addEventListener("click", async () => {
      confirmPopup.destroy("cancel");
    });
    confirmPopup.addDestructionListener((type) => {
      if (type == "cancel") resolve(false);
    });

    confirmPopup.appendContentNodes([wrapper]);
    confirmPopup.spawn();
  });
}
