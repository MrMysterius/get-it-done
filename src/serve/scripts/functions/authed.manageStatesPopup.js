import { Popup } from "./createPopup.js";
import { createNotice } from "./createNotice.js";
import { request } from "./request.js";

export async function manageStatesPopup(group_id) {
  const statesPopup = new Popup();

  const content = document.createElement("div");

  const group = await request("GET", `/api/groups/${group_id}`);
  const states = await request("GET", `/api/groups/${group_id}/states`);

  if (!group || !states || group.status != 200 || states.status != 200) {
    createNotice("Couldn't get group or states information", "error", 15000);
    return;
  }

  content.innerHTML += `<h3>States - ${group.data.group_name}</h3>`;

  content.innerHTML += `<button class="states-create-new" style="background-color: var(--notice-success); color: black;">CREATE NEW STATE</button><hr><br>`;

  const statesList = document.createElement("div");
  statesList.innerHTML += `<b>States:</b><br>`;
  statesList.appendChild(generateStatesTable(group_id, states.data, statesPopup));
  statesList.appendChild(document.createElement("hr"));

  content.appendChild(statesList);

  content.querySelector(".states-create-new").addEventListener("click", async () => {
    const res = await addState(group_id);
    if (res) {
      await manageStatesPopup(group_id);
      statesPopup.destroy();
    }
  });

  statesPopup.appendContentNodes([content]);
  statesPopup.spawn();
}

export function generateStatesTable(group_id, states, popup = null) {
  const table = document.createElement("table");
  for (const state of states) {
    const row = document.createElement("tr");
    row.innerHTML += `<td class="state-name" state-id="${state.id}" style="background-color: ${state.colour_background}; color: ${state.colour_text};">${state.name}</td>`;
    row.innerHTML += `<td class="state-description">${state.description}</td>`;
    row.innerHTML += `<td class="state-options"><button class="state-edit" style="background-color: var(--notice-warn); color: var(--notice-warn-text)">EDIT</button> <button class="state-delete" style="background-color: var(--notice-error)">DELETE</button></td>`;

    row.querySelector(".state-edit").addEventListener("click", async () => {
      const res = await editState(group_id, state);
      if (res && popup) {
        await manageStatesPopup(group_id);
        popup.destroy();
      }
    });
    row.querySelector(".state-delete").addEventListener("click", async () => {
      const res = await deleteState(group_id, state.id, state.name);
      if (res && popup) {
        await manageStatesPopup(group_id);
        popup.destroy();
      }
    });

    table.appendChild(row);
  }

  return table;
}

export async function addState(group_id) {
  return new Promise((resolve) => {
    const addPopup = new Popup();

    const wrapper = document.createElement("div");
    let content = "";
    content += `<h4>Add New State</h4><form><table>`;
    content += `<tr><td><b>Name:</b></td><td><input type="text" class="state-name" minlength="1" maxlength="100" placeholder="State Name" required></td></tr>`;
    content += `<tr><td><b>Description:</b></td><td><textarea type="text" class="state-description" maxlength="300" placeholder="State Description"></textarea></td></tr>`;
    content += `<tr><td><b>Colour Text:</b></td><td><input type="text" class="state-colour-txt" value="#000000" pattern="(^\#[0-9abcdefABCDEF]{6}$)|" placeholder="HEX Colour Code"><div class="state-colour-txt-preview" style="min-height: 10px; min-width: 10px; background-color: #000000;"></div></td></tr>`;
    content += `<tr><td><b>Colour Background:</b></td><td><input type="text" class="state-colour-bg" value="#66A3FF" pattern="(^\#[0-9abcdefABCDEF]{6}$)|" placeholder="HEX Colour Code"><div class="state-colour-bg-preview" style="min-height: 10px; min-width: 10px; background-color: #66A3FF;"></div></td></tr>`;
    content += `</table><button type="submit" class="submit" style="background-color: var(--notice-success); color: black;">CREATE</button> <button class="cancel">CANCEL</button></form>`;
    wrapper.innerHTML += content;

    wrapper.querySelector(".state-colour-txt").addEventListener("keyup", () => {
      if (wrapper.querySelector(".state-colour-txt").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".state-colour-txt-preview").style.backgroundColor = wrapper.querySelector(".state-colour-txt").value;
    });
    wrapper.querySelector(".state-colour-bg").addEventListener("keyup", () => {
      if (wrapper.querySelector(".state-colour-bg").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".state-colour-bg-preview").style.backgroundColor = wrapper.querySelector(".state-colour-bg").value;
    });

    wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
      ev.preventDefault();
      addPopup.destroy("cancel");
    });

    wrapper.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const name = wrapper.querySelector(".state-name").value;
      const description = wrapper.querySelector(".state-description").value;
      const colour_text = wrapper.querySelector(".state-colour-txt").value;
      const colour_background = wrapper.querySelector(".state-colour-bg").value;

      const data = {
        name,
        description,
        colour_text,
        colour_background,
      };

      if ("" == name) delete data.name;
      if ("" == description || description == "") delete data.description;
      if ("" == colour_text) delete data.colour_text;
      if ("" == colour_background) delete data.colour_background;

      const res = await request("POST", `/api/groups/${group_id}/states`, data);
      if (!res || res.status != 200) {
        console.log(res);
        addPopup.destroy("cancel");
        createNotice("Failed to create State", "error", 15000);
        return;
      }

      addPopup.destroy("finnished");
      createNotice("Successfully created State", "success", 5000);
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

export async function editState(group_id, state) {
  return new Promise((resolve) => {
    const editPopup = new Popup();

    const wrapper = document.createElement("div");
    let content = "";
    content += `<h4>Editing - ${state.name}</h4><form><table>`;
    content += `<tr><td><b>Name:</b></td><td><input type="text" class="state-name" value="${state.name}" minlength="1" maxlength="100" placeholder="State Name"></td></tr>`;
    content += `<tr><td><b>Description:</b></td><td><textarea type="text" class="state-description" value="${state.description}" maxlength="300" placeholder="State Description"></textarea></td></tr>`;
    content += `<tr><td><b>Colour Text:</b></td><td><input type="text" class="state-colour-txt" value="${state.colour_text}" pattern="^\#[0-9abcdefABCDEF]{6}$" placeholder="HEX Colour Code"><div class="state-colour-txt-preview" style="min-height: 10px; min-width: 10px; background-color: ${state.colour_text};"></div></td></tr>`;
    content += `<tr><td><b>Colour Background:</b></td><td><input type="text" class="state-colour-bg" value="${state.colour_background}" pattern="^\#[0-9abcdefABCDEF]{6}$" placeholder="HEX Colour Code"><div class="state-colour-bg-preview" style="min-height: 10px; min-width: 10px; background-color: ${state.colour_background};"></div></td></tr>`;
    content += `</table><button type="submit" class="submit" style="background-color: var(--notice-warn); color: black;">EDIT</button> <button class="cancel">CANCEL</button></form>`;
    wrapper.innerHTML += content;

    wrapper.querySelector(".state-colour-txt").addEventListener("keyup", () => {
      if (wrapper.querySelector(".state-colour-txt").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".state-colour-txt-preview").style.backgroundColor = wrapper.querySelector(".state-colour-txt").value;
    });
    wrapper.querySelector(".state-colour-bg").addEventListener("keyup", () => {
      if (wrapper.querySelector(".state-colour-bg").value.match(/^\#[0-9abcdefABCDEF]{6}$/))
        wrapper.querySelector(".state-colour-bg-preview").style.backgroundColor = wrapper.querySelector(".state-colour-bg").value;
    });

    wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
      ev.preventDefault();
      editPopup.destroy("cancel");
    });

    wrapper.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const name = wrapper.querySelector(".state-name").value;
      const description = wrapper.querySelector(".state-description").value;
      const colour_text = wrapper.querySelector(".state-colour-txt").value;
      const colour_background = wrapper.querySelector(".state-colour-bg").value;

      const data = {
        name,
        description,
        colour_text,
        colour_background,
      };

      if (state.name == name) delete data.name;
      if (state.description == description || description == "") delete data.description;
      if (state.colour_text == colour_text) delete data.colour_text;
      if (state.colour_background == colour_background) delete data.colour_background;

      const res = await request("PUT", `/api/groups/${group_id}/states/${state.id}`, data);
      if (!res || res.status != 200) {
        console.log(res);
        editPopup.destroy("cancel");
        createNotice("Failed to update State", "error", 15000);
        return;
      }

      editPopup.destroy("finnished");
      createNotice("Successfully edited State", "success", 5000);
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

export async function deleteState(group_id, state_id, state_name = "") {
  return new Promise((resolve) => {
    const confirmPopup = new Popup();

    const wrapper = document.createElement("div");
    wrapper.innerHTML += `<h4>Delete this State ${state_name}?</h4>`;
    wrapper.innerHTML += `<button class="confirm" style="background-color: var(--notice-error)">CONFIRM</button> `;
    wrapper.innerHTML += `<button class="cancel">CANCEL</button>`;

    wrapper.querySelector(".confirm").addEventListener("click", async () => {
      const res = await request("DELETE", `/api/groups/${group_id}/states/${state_id}`);
      if (!res || res.status != 200) {
        confirmPopup.destroy("cancel");
        console.log(res);
        createNotice("Failed to delete State", "error", 15000);
        return;
      }

      confirmPopup.destroy("finnished");
      createNotice("Successfully deleted State", "success", 5000);
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
