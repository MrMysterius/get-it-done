import { Popup } from "./createPopup.js";
import { createNotice } from "./createNotice.js";
import { request } from "./request.js";

export async function manageInboxesPopup(group_id) {
  const inboxesPopup = new Popup();

  const content = document.createElement("div");

  const groupReq = await request("GET", `/api/groups/${group_id}`);
  const inboxesReq = await request("GET", `/api/groups/${group_id}/inboxes`);

  const [group, inboxes] = await Promise.all([groupReq, inboxesReq]);

  if (group?.status != 200 || inboxes?.status != 200) {
    createNotice("Couldn't get group or inboxes information", "error", 15000);
    return;
  }

  content.innerHTML += `<h3>Inboxes - ${group.data.group_name}</h3>`;

  content.innerHTML += `<button class="inboxes-create-new" style="background-color: var(--notice-success); color: black;">CREATE NEW INBOX</button> <button class="inboxes-info" style="background-color: var(--notice-info); color: var(--notice-info-text);">INFO</button><hr><br>`;

  const statesList = document.createElement("div");
  statesList.innerHTML += `<b>Inboxes:</b><br>`;
  statesList.appendChild(generateInboxesTable(group_id, inboxes.data, inboxesPopup));
  statesList.appendChild(document.createElement("hr"));

  content.appendChild(statesList);

  content.querySelector(".inboxes-create-new").addEventListener("click", async () => {
    const res = await addInbox(group_id);
    if (res) {
      await manageInboxesPopup(group_id);
      inboxesPopup.destroy();
    }
  });

  content.querySelector(".inboxes-info").addEventListener("click", () => {
    const infoPopup = new Popup();
    const infoContent = document.createElement("div");
    infoContent.innerHTML += `<p>How inboxes work is you can use the CODE of an Inbox to do a POST Request to the API Endpoint '/api/inboxes/INBOXCODE' <br>with a JSON Body that has an Object that looks like this '{ tasks: "NEW TASK NAME" }' and then it will create <br>this new task in this group and add all the tags that the inbox has configured to this task on top. <br>This way you can quickly from any third party add a new Task without sharing login details or being logged in yourself.</p>`;
    infoPopup.appendContentNodes([infoContent]);
    infoPopup.spawn();
  });

  inboxesPopup.appendContentNodes([content]);
  inboxesPopup.spawn();
}

export function generateInboxesTable(group_id, inboxes, popup = null) {
  const table = document.createElement("table");
  for (const inbox of inboxes) {
    const row = document.createElement("tr");
    row.innerHTML += `<td class="inbox-code" inbox-id="${inbox.inbox_code}"><pre style="background-color: gray">${inbox.inbox_code}</pre></td>`;
    row.innerHTML += `<td class="inbox-tags">${inbox.inbox_extras.tags.join(", ")}</td>`;
    row.innerHTML += `<td class="inbox-options"><button class="inbox-edit" style="background-color: var(--notice-warn); color: var(--notice-warn-text)">EDIT</button> <button class="inbox-delete" style="background-color: var(--notice-error)">DELETE</button></td>`;

    row.querySelector(".inbox-edit").addEventListener("click", async () => {
      const res = await editInbox(group_id, inbox);
      if (res && popup) {
        await manageInboxesPopup(group_id);
        popup.destroy();
      }
    });
    row.querySelector(".inbox-delete").addEventListener("click", async () => {
      const res = await deleteInbox(group_id, inbox.inbox_code);
      if (res && popup) {
        await manageInboxesPopup(group_id);
        popup.destroy();
      }
    });

    table.appendChild(row);
  }

  return table;
}

export async function addInbox(group_id) {
  return new Promise((resolve) => {
    const addPopup = new Popup();

    const wrapper = document.createElement("div");
    let content = "";
    content += `<h4>Creating New Inbox</h4><form><table>`;
    content += `<tr><td><b>Tags:</b></td><td><input type="text" class="inbox-tags" minlength="0" maxlength="300" placeholder="Inbox Tags Comma Seperated"></td></tr>`;
    content += `</table><button type="submit" class="submit" style="background-color: var(--notice-success); color: black;">CREATE</button> <button class="cancel">CANCEL</button></form>`;
    wrapper.innerHTML += content;

    wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
      ev.preventDefault();
      addPopup.destroy("cancel");
    });

    wrapper.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const tags = wrapper.querySelector(".inbox-tags").value.split(",");

      const data = {
        extras: {
          tags,
        },
      };

      if ([] == tags.join(",")) delete data.extras;

      const res = await request("POST", `/api/groups/${group_id}/inboxes`, data);
      if (!res || res.status != 200) {
        console.log(res);
        addPopup.destroy("cancel");
        createNotice("Failed to create Inbox", "error", 15000);
        return;
      }

      addPopup.destroy("finnished");
      createNotice("Successfully created Inbox", "success", 5000);
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

export async function editInbox(group_id, inbox) {
  return new Promise((resolve) => {
    const editPopup = new Popup();

    const wrapper = document.createElement("div");
    let content = "";
    content += `<h4>Editing - ${inbox.inbox_code}</h4><form><table>`;
    content += `<tr><td><b>Tags:</b></td><td><input type="text" class="inbox-tags" value="${inbox.inbox_extras.tags.join(
      ","
    )}" minlength="0" maxlength="300" placeholder="Inbox Tags Comma Seperated"></td></tr>`;
    content += `</table><button type="submit" class="submit" style="background-color: var(--notice-warn); color: black;">EDIT</button> <button class="cancel">CANCEL</button></form>`;
    wrapper.innerHTML += content;

    wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
      ev.preventDefault();
      editPopup.destroy("cancel");
    });

    wrapper.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const tags = wrapper.querySelector(".inbox-tags").value.split(",");

      const data = {
        extras: {
          tags,
        },
      };

      if (inbox.inbox_extras.tags.join(",") == tags.join(",")) delete data.extras;

      const res = await request("PUT", `/api/groups/${group_id}/inboxes/${inbox.inbox_code}`, data);
      if (!res || res.status != 200) {
        console.log(res);
        editPopup.destroy("cancel");
        createNotice("Failed to update Inbox", "error", 15000);
        return;
      }

      editPopup.destroy("finnished");
      createNotice("Successfully updated Inbox", "success", 5000);
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

export async function deleteInbox(group_id, inbox_code) {
  return new Promise((resolve) => {
    const confirmPopup = new Popup();

    const wrapper = document.createElement("div");
    wrapper.innerHTML += `<h4>Delete this Inbox ${inbox_code}?</h4>`;
    wrapper.innerHTML += `<button class="confirm" style="background-color: var(--notice-error)">CONFIRM</button> `;
    wrapper.innerHTML += `<button class="cancel">CANCEL</button>`;

    wrapper.querySelector(".confirm").addEventListener("click", async () => {
      const res = await request("DELETE", `/api/groups/${group_id}/inboxes/${inbox_code}`);
      if (!res || res.status != 200) {
        confirmPopup.destroy("cancel");
        console.log(res);
        createNotice("Failed to delete Inbox", "error", 15000);
        return;
      }

      confirmPopup.destroy("finnished");
      createNotice("Successfully deleted Inbox", "success", 5000);
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
