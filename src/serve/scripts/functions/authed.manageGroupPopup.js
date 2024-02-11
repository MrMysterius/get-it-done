import { checkGroup } from "./authed.checkGroup.js";
import { createNotice } from "./createNotice.js";
import { createPopup } from "./createPopup.js";
import { getUrlParam } from "./authed.urlData.js";
import { populateFilters } from "./authed.populateFilters.js";
import { populateGroups } from "./authed.populateGroups.js";
import { request } from "./request.js";
import { switchGroup } from "./authed.switchGroup.js";

export async function manageGroupPopup() {
  const group_id = getUrlParam("g");

  const wrapper = document.createElement("div");
  const group = await request("GET", `/api/groups/${group_id}`);
  const members = await request("GET", `/api/groups/${group_id}/members`);
  const me = await request("GET", `/api/me`);
  if (!group || !members || !me) {
    console.log(group, members, me);
    createNotice(`Couldn't open group management for group ${group_id}`, "error", 15000);
    return;
  }
  if (group.status != 200 || members.status != 200 || me.status != 200) {
    console.log(group, members, me);
    createNotice(`Couldn't open group management for group ${group_id}`, "error", 15000);
    return;
  }

  members.data.sort((a, b) => b.group_role.localeCompare(a.group_role));

  wrapper.innerHTML += `<h3>Management - ${group.data.group_name}`;

  let ownerPart = "";
  ownerPart += `<div><b>Owner:</b> <p style="display: inline;" title="${group.data.group_owner.user_name}">${
    group.data.group_owner.user_display_name || group.data.group_owner.user_name
  }</p>`;
  if (me.data.user_id == group.data.group_owner.user_id) ownerPart = `<button class="group-delete">DELETE GROUP</button>`;
  ownerPart += `</div><br><hr>`;

  wrapper.innerHTML += ownerPart;

  let membersPart = `<p><b>Members:</b> `;
  if (me.data.user_id == group.data.group_owner.user_id) membersPart += `<button class="group-member-add">ADD MEMBER</button>`;
  membersPart += `</p><table class="group-members">`;

  membersPart += createMembersTable(group, members, me);

  membersPart += "</table>";

  wrapper.innerHTML += membersPart;

  for (const row of wrapper.querySelectorAll("tr").values()) {
    const member_id_match = row.querySelector(".group-member").id.match(/group-member-(?<name>\d+$)/);
    if (!member_id_match || !member_id_match.groups?.name) continue;
    const member_id = member_id_match.groups?.name;

    const removeBtn = row.querySelector(".group-member-remove");

    removeBtn?.addEventListener("click", async () => {
      removeBtn.setAttribute("disabled", "");
      const res = await request("DELETE", `/api/groups/${group.data.group_id}/members/${member_id}`);
      if (!res || res.status != 200) {
        createNotice("Couldn't remove Member from Group", "error", 15000);
        return;
      }

      createNotice("Removed Member from Group", "success", 5000);
      row.remove();
    });
  }

  const popupGroupManage = createPopup(wrapper);

  wrapper.querySelector(`.group-member-add`)?.addEventListener("click", async () => {
    const wrapperAddMember = document.createElement("div");
    wrapperAddMember.innerHTML += `<input type="text" class="new-member-name" placeholder="New Group Member..."></input>`;
    wrapperAddMember.innerHTML += `<button class="new-member-add">ADD</button>`;

    const addBtn = wrapperAddMember.querySelector(".new-member-add");
    const nameInput = wrapperAddMember.querySelector(".new-member-name");

    const popup = createPopup(wrapperAddMember, (w, s) => {
      if (s == "opened") {
        w.querySelector(".new-member-name")?.focus();
        return;
      }
    });

    const addMemberFunction = async () => {
      addBtn.setAttribute("disabled", "");
      nameInput.setAttribute("disabled", "");
      const new_member_name = wrapperAddMember.querySelector(".new-member-name").value;

      const res = await request("POST", `/api/groups/${group.data.group_id}/members`, { user_name: new_member_name });
      if (!res || res.status != 200) {
        createNotice(`Couldn't add ${new_member_name} as a group member - User might not exists`, "error", 15000);
        popup.remove();
        return;
      }

      createNotice(`Added ${new_member_name} as a new group member`, "success", 5000);
      popup.remove();
      popupGroupManage.remove();
      manageGroupPopup();
      return;
    };

    addBtn.addEventListener("click", addMemberFunction);
    nameInput.addEventListener("keypress", (ev) => {
      if (ev?.key != "Enter") return;
      addMemberFunction();
    });
  });

  wrapper.querySelector(".group-delete").addEventListener("click", async () => {
    wrapper.querySelector(".group-delete").setAttribute("disabled", "");

    const div = document.createElement("div");
    div.innerHTML = `<button class="group-delete-confirm">CONFIRM DELETE</button>`;

    const popup = createPopup(div);

    div.querySelector(".group-delete-confirm").addEventListener("click", async () => {
      const res = await request("DELETE", `/api/groups/${group.data.group_id}`);
      if (!res || res.status != 200) {
        createNotice(`Couldn't delete group ${group.data.group_name}`, "error", 15000);
        popup.remove();
        popupGroupManage.remove();
        manageGroupPopup();
        return;
      }
      createNotice(`Deleted group ${group.data.group_name}`, "success", 5000);

      popup.remove();
      popupGroupManage.remove();
      await checkGroup();
      await populateGroups();
      await populateFilters();
      switchGroup();
      return;
    });
  });
}

function createMembersTable(group, members, me) {
  let members_table = "";

  for (const member of members.data) {
    members_table += `<tr>
    <td class="group-member" id="group-member-${member.user_id}"><p title="${member.user_name}">${member.user_displayname || member.user_name}</p></td>
    <td>${member.group_role.toUpperCase()}</td>`;

    if (me.data.user_id == group.data.group_owner.user_id)
      members_table += `<td>${member.group_role == "member" ? `<button class="group-member-remove">REMOVE</button>` : ""}</td>`;

    members_table += `</tr>`;
  }

  return members_table;
}
