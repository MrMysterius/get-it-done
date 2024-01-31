import { checkGroup } from "./authed.checkGroup.js";
import { createNotice } from "./createNotice.js";
import { createPopup } from "./createPopup.js";
import { populateGroups } from "./authed.populateGroups.js";
import { populateTasks } from "./authed.populateTasks.js";
import { request } from "./authed.request.js";
import { switchGroup } from "./authed.switchGroup.js";

export function createNewGroup() {
  const content = document.createElement("div");
  content.classList.add("group-new");
  content.innerHTML += `<input class="group-new-name" type="text" placeholder="New Group Name...">`;
  content.innerHTML += `<button class="group-new-create">CREATE</button>`;
  content.innerHTML += `<button class="group-new-close">CLOSE</button>`;

  createPopup(content, async (wrapper, state) => {
    if (state == "closed") {
      await checkGroup();
      await populateGroups();
      switchGroup();
      return;
    }

    if (state == "opened") {
      const cont = wrapper.querySelector(".group-new");
      const nameEl = cont.querySelector(".group-new-name");

      cont.querySelector(".group-new-close").addEventListener("click", async (ev) => {
        ev.srcElement.setAttribute("disabled", "");
        await checkGroup();
        await populateGroups();
        switchGroup();
        wrapper.remove();
      });

      const createRequest = async (ev) => {
        ev.srcElement.setAttribute("disabled", "");
        nameEl.setAttribute("disabled", "");
        const newGroupName = nameEl.value;
        const res = await request("POST", "/api/groups", {
          group_name: newGroupName,
        });

        if (!res || res.status != 200) {
          await checkGroup();
          await populateGroups();
          switchGroup();
          console.log(res);
          wrapper.remove();
          createNotice("Couldn't create group", "error", 15000);
          return;
        }

        switchGroup(res.data.group_id);
        await checkGroup();
        await populateGroups();
        wrapper.remove();
        createNotice("Created new Group", "success", 5000);
        await populateTasks();
        return;
      };

      cont.querySelector(".group-new-create").addEventListener("click", createRequest);
      cont.querySelector(".group-new-name").addEventListener("keypress", (ev) => {
        if (ev?.key != "Enter") return;
        createRequest(ev);
      });
    }
  });
}
