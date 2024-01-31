export function createNotice(text, type = "info", timeout = 0) {
  const newNotice = document.querySelector("#template-notice")?.content?.cloneNode(true) || null;
  if (!newNotice) return false;

  const wrapperDiv = newNotice.querySelector(".notice");
  wrapperDiv.classList.add(type);
  wrapperDiv.addEventListener("click", (ev) => {
    wrapperDiv.classList.add("remove");
    setTimeout(() => {
      wrapperDiv.remove();
    }, 500);
  });

  if (timeout) {
    setTimeout(() => {
      wrapperDiv.classList.add("remove");
      setTimeout(() => {
        wrapperDiv.remove();
      }, 500);
    }, timeout);
  }

  wrapperDiv.querySelector(".notice-text").innerHTML = text;

  document.querySelector("#notice-container").appendChild(newNotice);

  return true;
}
