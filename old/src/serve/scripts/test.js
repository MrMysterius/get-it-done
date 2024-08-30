import { SuggestionDialog } from "./functions/authed.suggestionsDialog.js";

function getCursorPosition(inputElement) {
  const dummyDiv = document.createElement("div");
  const { selectionStart: inputSelectionStart, selectionEnd: inputSelectionEnd, offsetTop: inputY, offsetLeft: inputX } = inputElement;

  const inputElementStyle = getComputedStyle(inputElement);
  for (const prop of inputElementStyle) {
    dummyDiv.style[prop] = inputElementStyle[prop];
  }
  dummyDiv.style.position = "absolute";
  dummyDiv.style.top = "0";
  dummyDiv.style.left = "0";

  const fontSize = inputElementStyle.fontSize;

  const inputValue = inputElement.tagName === "INPUT" ? inputElement.value.replace(/ /g, ".") : inputElement.value;
  dummyDiv.textContent = inputValue.substr(0, Math.max(inputSelectionStart, inputSelectionEnd) - 1);

  if (inputElement.tagName === "TEXTAREA") dummyDiv.style.height = "auto";
  if (inputElement.tagName === "INPUT") dummyDiv.style.width = "auto";

  const dummyCursor = document.createElement("span");
  dummyCursor.textContent = inputValue.substr(inputSelectionStart - 1) || ".";

  dummyDiv.appendChild(dummyCursor);

  document.body.appendChild(dummyDiv);

  const { offsetTop: cursorY, offsetLeft: cursorX } = dummyCursor;

  document.body.removeChild(dummyDiv);

  console.log(inputY, inputX);
  console.log(cursorY, cursorX);

  return {
    relativeY: cursorY,
    relativeX: cursorX,
    absoluteY: inputY + cursorY,
    absoluteX: inputX + cursorX,
    fontSize: parseFloat(fontSize),
  };
}

function spawnAutocomplete(input) {
  const autocompleteDiv = document.querySelector("#autocomplete");
  console.log(!input.value.substr(0, input.selectionStart).endsWith("/"), input.value);
  if (!input.value.substr(0, input.selectionStart).endsWith("/")) {
    autocompleteDiv.style["display"] = "none";
    return;
  }

  const pos = getCursorPosition(input);
  console.log(pos);

  autocompleteDiv.innerHTML = `<p style="margin: 0; padding: 0;">THIS IS A TEST</p>`;

  autocompleteDiv.style["top"] = `${pos.absoluteY + parseFloat(pos.fontSize) * 1.2}px`;
  autocompleteDiv.style["left"] = `${pos.absoluteX}px`;
  autocompleteDiv.style["display"] = "flex";
}

window.addEventListener("DOMContentLoaded", () => {
  const testarea = document.querySelector("#testarea");
  let timeoutID;

  testarea.addEventListener("keyup", () => {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      spawnAutocomplete(testarea);
    }, 300);
  });
  testarea.addEventListener("click", () => {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      spawnAutocomplete(testarea);
    }, 300);
  });

  const dialog = new SuggestionDialog(document.querySelector("#dialogtest"));

  const options = [];
  for (let i = 0; i < 100; i++) {
    const pEl = document.createElement("p");
    pEl.textContent = `ID: ${i}`;
    options.push({ element: pEl, id: i.toString() });
  }
  dialog.setOptions(options.slice(0, 10));

  let previousText = "";
  dialog.addInputChangeListener((t) => {
    if (t?.selected != undefined) {
      const option = options.find((o) => o.id == t?.option.id);
      if (!option) return;
      const selectionStart = dialog.originInputElement.selectionStart;
      const newText = `[${option.id}]`;
      dialog.originInputElement.value =
        dialog.originInputElement.value.substr(0, dialog.originInputElement.selectionStart).replace(/\#\d*$/, newText) +
        dialog.originInputElement.value.substr(dialog.originInputElement.selectionStart);

      dialog.originInputElement.selectionStart = selectionStart + newText.length - 1;
      dialog.originInputElement.selectionEnd = selectionStart + newText.length - 1;
    }

    const text = dialog.originInputElement.value.substr(0, dialog.originInputElement.selectionStart);
    if (text == previousText) return;
    previousText = text;
    if (!text.match(/\#\d*$/)) {
      dialog.hideDialog();
      return;
    }
    const match = text.match(/\#(?<id>\d*)$/);
    if (!match || !match.groups.id) {
      dialog.setOptions(options.slice(0, 10));
      dialog.showDialog();
      return;
    }
    dialog.setOptions(options.filter((o) => o.id.startsWith(match.groups.id)).slice(0, 10));
    dialog.showDialog();
  });
});
