export function createPopup(popupContent, cb = (popupWrapper, state) => {}) {
  const newPopup = document.querySelector("#template-popup")?.content?.cloneNode(true) || null;
  if (!newPopup) return false;

  const wrapperDiv = newPopup.querySelector(".popup");
  const content = wrapperDiv.querySelector(".popup-content");

  wrapperDiv.addEventListener("click", (ev) => {
    if (ev?.srcElement != wrapperDiv) return;
    wrapperDiv.remove();
    cb(wrapperDiv, "closed");
  });
  content.querySelector(".popup-close").addEventListener("click", (ev) => {
    wrapperDiv.remove();
    cb(wrapperDiv, "closed");
  });

  try {
    popupContent.map((c) => content.appendChild(c));
  } catch (e) {
    try {
      content.appendChild(popupContent);
    } catch (e) {}
  }

  document.querySelector("#popup-container").appendChild(newPopup);

  cb(wrapperDiv, "opened");
  return wrapperDiv;
}

export class Popup {
  popupElement;

  constructor() {
    const newPopup = document.querySelector("#template-popup")?.content?.cloneNode(true) || null;
    if (!newPopup) throw new Error("Couldn't create Popup, no Template Element found.");

    this.popupElement = newPopup.querySelector(".popup");
  }

  spawn() {
    const container = document.querySelector("#popup-container");
    if (!container) throw new Error("Couldn't spawn Popup, Popup Container Missing.");
    container.appendChild(this.popupElement);
  }

  appendContentFromString(newContent) {
    const contentWrapper = this.popupElement.querySelector(".popup-content");
    if (!contentWrapper) throw new Error("Couldn't append new popup content.");
    const div = document.createElement("div");
    div.innerHTML = newContent;

    contentWrapper.appendChild(div);
  }

  appendContentNodes(newContentNodes = []) {
    if (!newContentNodes.map) throw new Error("Expected an Array of new content nodes.");
    const contentWrapper = this.popupElement.querySelector(".popup-content");
    if (!contentWrapper) throw new Error("Couldn't append new popup content.");

    newContentNodes.forEach((newContentNode) => {
      contentWrapper.appendChild(newContentNode);
    });
  }

  close() {
    this.popupElement.remove();
    this.destroy();
  }
}
