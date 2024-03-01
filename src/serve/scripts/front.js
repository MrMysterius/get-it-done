import { createNotice } from "./functions/createNotice.js";
import { request } from "./functions/request.js";

let loginLock = false;
let signupLock = false;

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("form#login-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();

    if (loginLock) return;
    loginLock = true;
    lockLogin(true);

    const res = await request("POST", "/auth", {
      username: document.querySelector("#login-username").value,
      password: document.querySelector("#login-password").value,
    });
    if (!res) {
      createNotice("Login Failed - Unexpected Error", "error", 10000);
      loginLock = false;
      lockLogin(false);
      return;
    }
    if (res.status == 400) {
      createNotice("Login Failed - Missing Username or Password", "warn", 10000);
      loginLock = false;
      lockLogin(false);
      return;
    }
    if (res.status == 401) {
      createNotice("Login Failed - Incorrect Username or Password", "error", 10000);
      loginLock = false;
      lockLogin(false);
      return;
    }
    if (res.status == 200) {
      createNotice("Login Succeeded - Redirecting...", "success", 5000);
      setTimeout(() => {
        window.location.replace("/tasks");
      }, 1000);
      return;
    }

    loginLock = false;
    lockLogin(false);
    return;
  });

  document.querySelector("form#signup-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();

    if (signupLock) return;
    signupLock = true;
    lockSignup(true);

    const res = await request("POST", "/signup", {
      username: document.querySelector("#signup-username").value,
      password: document.querySelector("#signup-password").value,
      invite_code: document.querySelector("#signup-invitecode").value,
    });
    if (!res) {
      createNotice("Login Failed - Unexpected Error", "error", 10000);
      signupLock = false;
      lockSignup(false);
      return;
    }
    if (res.status == 400) {
      createNotice("Login Failed - Missing or Invalid Username, Password or Invite Code", "error", 10000);
      signupLock = false;
      lockSignup(false);
      return;
    }
    if (res.status == 200) {
      createNotice("Signup Succeeded - You can now login", "success", 5000);
      document.querySelector("#signup-username").value = "";
      document.querySelector("#signup-password").value = "";
      document.querySelector("#signup-invitecode").value = "";
      signupLock = false;
      lockSignup(false);
      return;
    }

    signupLock = false;
    lockSignup(false);
    return;
  });
});

function lockLogin(bool = true) {
  for (const el of document.querySelectorAll("form#login-form input, form#login-form button").values()) {
    if (bool) {
      if (el.tagName == "BUTTON") el.classList.add("loading");
      el.setAttribute("disabled", "");
    } else {
      if (el.tagName == "BUTTON") el.classList.remove("loading");
      el.removeAttribute("disabled");
    }
  }
}

function lockSignup(bool = true) {
  for (const el of document.querySelectorAll("form#signup-form input, form#signup-form button").values()) {
    if (bool) {
      if (el.tagName == "BUTTON") el.classList.add("loading");
      el.setAttribute("disabled", "");
    } else {
      if (el.tagName == "BUTTON") el.classList.remove("loading");
      el.removeAttribute("disabled");
    }
  }
}
