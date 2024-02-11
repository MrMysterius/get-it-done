import { Popup } from "./createPopup.js";
import { createNotice } from "./createNotice.js";
import { request } from "./request.js";

export async function manageUserPopup() {
  const me = await request("GET", `/api/me`);

  if (!me || me.status != 200) {
    createNotice("Couldn't get user information", "error", 15000);
    return;
  }

  const userPopup = new Popup();

  const wrapper = document.createElement("div");
  wrapper.innerHTML += `<h4>User Settings - ${me.data.user_name}</h4><hr>`;

  let form = "<form><table>";
  form += `<tr><td><b>User Name</b></td><td><input type="text" class="user-name" value="${me.data.user_name}" placeholder="User Name" required minlength="1" maxlength="40" pattern="[0-9a-zA-Z\.\_\-]+"></td></tr>`;
  form += `<tr><td><b>Display Name</b></td><td><input type="text" class="user-displayname" value="${me.data.user_displayname}" placeholder="Display Name" minlength="0" maxlength="40"></td></tr>`;
  form += `<tr><td><b>New Password</b></td><td><input type="password" class="user-password" placeholder="New Password" maxlength="128"></td></tr>`;
  form += `</table><button class="confirm" type="submit" style="background-color: var(--notice-warn); color: black;">UPDATE</button> <button class="cancel">CANCEL</button></form>`;

  wrapper.innerHTML += form;

  wrapper.querySelector(".cancel").addEventListener("click", (ev) => {
    ev.preventDefault();
    userPopup.destroy("canceled");
  });
  wrapper.querySelector("form").addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const user_name = wrapper.querySelector(".user-name").value;
    const user_displayname = wrapper.querySelector(".user-displayname").value;
    const new_password = wrapper.querySelector(".user-password").value;

    const data = {
      user_name,
      user_displayname,
      password: new_password,
    };

    if (me.data.user_name == user_name) delete data.user_name;
    if (me.data.pass == user_name) delete data.user_name;
    if ("" == new_password) delete data.password;

    const res = await request("PUT", `/api/users/${me.data.user_id}`, data);
    if (!res || res.status != 200) {
      console.log(res);
      userPopup.destroy("canceled");
      createNotice("Couldn't update user information", "error", 15000);
      return;
    }

    userPopup.destroy("finnished");
    createNotice("User information updated", "success", 5000);
    return;
  });

  userPopup.appendContentNodes([wrapper]);
  userPopup.spawn();
}
