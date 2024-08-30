export class SuggestionDialog {
  originInputElement;
  listeners = [];
  dialogWrapper;
  options = [];
  optionSelection = 0;

  constructor(originInputElement) {
    this.originInputElement = originInputElement;

    const Dialog = this;
    originInputElement.addEventListener("keydown", (ev) => {
      Dialog.processKeystroke(ev);
    });
    originInputElement.addEventListener("keyup", (ev) => {
      Dialog.callListeners(ev);
    });
    originInputElement.addEventListener("click", (ev) => {
      Dialog.callListeners(ev);
    });

    const templateClone = document.querySelector("#template-suggestion")?.content?.cloneNode(true) || null;
    if (templateClone) {
      this.dialogWrapper = templateClone.querySelector(".suggestion-dialog");
    } else {
      this.dialogWrapper = document.createElement("div");
      this.dialogWrapper.classList.add("suggestion-dialog");
    }

    this.dialogWrapper.style.display = "none";
    this.dialogWrapper.style.position = "absolute";
    this.dialogWrapper.style.top = "0px";
    this.dialogWrapper.style.left = "0px";

    document.body.appendChild(this.dialogWrapper);
  }

  getCursorPosition() {
    const dummyDiv = document.createElement("div");
    const { selectionStart: inputSelectionStart, selectionEnd: inputSelectionEnd, offsetTop: inputY, offsetLeft: inputX } = this.originInputElement;

    const inputElementStyle = getComputedStyle(this.originInputElement);
    for (const prop of inputElementStyle) {
      dummyDiv.style[prop] = inputElementStyle[prop];
    }
    dummyDiv.style.position = "absolute";
    dummyDiv.style.top = "0";
    dummyDiv.style.left = "0";

    const fontSize = inputElementStyle.fontSize;

    const inputValue = this.originInputElement.tagName === "INPUT" ? this.originInputElement.value.replace(/ /g, ".") : this.originInputElement.value;
    dummyDiv.textContent = inputValue.substr(0, Math.max(inputSelectionStart, inputSelectionEnd) - 1);

    if (this.originInputElement.tagName === "TEXTAREA") dummyDiv.style.height = "auto";
    if (this.originInputElement.tagName === "INPUT") dummyDiv.style.width = "auto";

    const dummyCursor = document.createElement("span");
    dummyCursor.textContent = inputValue.substr(inputSelectionStart - 1) || ".";

    dummyDiv.appendChild(dummyCursor);

    document.body.appendChild(dummyDiv);

    const { offsetTop: cursorY, offsetLeft: cursorX } = dummyCursor;

    document.body.removeChild(dummyDiv);

    return {
      relativeY: cursorY,
      relativeX: cursorX,
      absoluteY: inputY + cursorY,
      absoluteX: inputX + cursorX,
      fontSize: parseFloat(fontSize),
    };
  }

  addInputChangeListener(cb) {
    this.listeners.push(cb);
  }

  callListeners(...params) {
    const Dialog = this;
    this.listeners.forEach(async (listener) => {
      console.log(Dialog);
      listener.call(Dialog, ...params);
    });
  }

  showDialog() {
    this.dialogWrapper.style.display = "flex";
  }

  hideDialog() {
    this.dialogWrapper.style.display = "none";
  }

  setOptions(options) {
    Array.from(this.dialogWrapper.children).map((child) => child.remove());
    this.options = options;
    this.optionSelection = 0;

    for (const [index, option] of options.entries()) {
      if (index == 0) option.element.classList.add("selected");
      this.dialogWrapper.appendChild(option.element);
    }
  }

  changeSelectedOption(select = null) {
    if (select == null) {
      select = this.optionSelection;
    }

    for (const [index, option] of this.options.entries()) {
      console.log(index, option, select);
      option.element.classList.remove("selected");
      if (index != select) continue;
      option.element.classList.add("selected");
    }

    this.callListeners({ currentSelection: select });
  }

  selectOption(select = null) {
    if (select == null) {
      select = this.optionSelection;
    }

    this.callListeners({ selected: select, option: this.options[select] });
  }

  processKeystroke(ev) {
    const pos = this.getCursorPosition();
    this.dialogWrapper.style.top = `${pos.absoluteY + pos.fontSize * 1.2}px`;
    this.dialogWrapper.style.left = `${pos.absoluteX}px`;

    if (this.options.length == 0 || this.dialogWrapper.style.display === "none") return;
    switch (ev.key) {
      case "ArrowUp":
        ev.preventDefault();
        this.optionSelection -= 1;
        if (this.optionSelection < 0) this.optionSelection = this.options.length - 1;
        this.changeSelectedOption();
        break;
      case "ArrowDown":
        ev.preventDefault();
        this.optionSelection += 1;
        if (this.optionSelection > this.options.length - 1) this.optionSelection = 0;
        this.changeSelectedOption();
        break;
      case "Enter":
        ev.preventDefault();
        this.selectOption();
        break;
    }
  }
}

//TODO Add Mouse Hover Selection
//TODO Add Tab Selection
//TODO Add Ctrl Z Logic
