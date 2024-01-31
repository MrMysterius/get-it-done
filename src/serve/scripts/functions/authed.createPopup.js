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
  return newPopup;
}
