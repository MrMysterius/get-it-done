import { Popup } from "./createPopup.js";
import { request } from "./request.js";

export async function checkChangelog() {
  const lastVersion = localStorage.getItem("changelog-last-version");
  const changelog = await request("GET", "/api/changelog");

  if (changelog?.status != 200) return;

  const log = changelog.data.changelog;
  log.sort((a, b) => b.version.localeCompare(a.version));
  localStorage.setItem("changelog-last-version", log[0].version);

  if (!lastVersion) {
    displayChangelog(log);
  } else {
    if (lastVersion == log[0].version) return;
    displayChangelog(
      log.slice(
        0,
        log.findIndex((l) => l.version == lastVersion)
      )
    );
  }
}

function displayChangelog(changes) {
  const ChangelogPopup = new Popup();

  const content = document.createElement("div");

  content.innerHTML += `<h3>CHANGELOG</h3>`;

  for (const change of changes) {
    const changeDiv = document.createElement("details");

    changeDiv.innerHTML += `<summary>V${change.version} - ${change.title}</summary>`;
    changeDiv.innerHTML += `<p><i>${change.description}</i></p>`;

    for (const [type, changes] of Object.entries(change.changes)) {
      if (changes.length == 0) continue;
      const details = document.createElement("div");

      details.innerHTML += `<b>${type.toUpperCase()}</b>`;
      const list = document.createElement("ul");

      for (const txt of changes) {
        list.innerHTML += `<li>${txt}</li>`;
      }

      details.appendChild(list);
      changeDiv.appendChild(details);
    }

    content.appendChild(changeDiv);
    content.appendChild(document.createElement("hr"));
  }

  ChangelogPopup.appendContentNodes([content]);
  ChangelogPopup.spawn();
}
