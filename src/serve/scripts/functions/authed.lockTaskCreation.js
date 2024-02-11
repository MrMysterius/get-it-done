export function lockTaskCreator(bool) {
  if (bool) {
    document.querySelector("#task-new-title").setAttribute("disabled", "");
  } else {
    document.querySelector("#task-new-title").removeAttribute("disabled");
  }
}
