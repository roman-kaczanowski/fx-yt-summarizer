(async function injectPendingPrompt() {
  const response = await browser.runtime.sendMessage({ type: "getPendingPrompt" });
  const prompt = response?.prompt;
  if (!prompt) return;

  const deadline = Date.now() + 20000;

  function findEditor() {
    const selectors = [
      'div[contenteditable="true"][aria-label]',
      'rich-textarea div[contenteditable="true"]',
      '.ql-editor[contenteditable="true"]',
      'div[contenteditable="true"]',
      "textarea",
    ];
    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const node of nodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.offsetParent === null && node.getClientRects().length === 0) continue;
        return node;
      }
    }
    return null;
  }

  function setEditorText(editor, text) {
    editor.focus();

    if (editor instanceof HTMLTextAreaElement || editor instanceof HTMLInputElement) {
      editor.value = text;
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // Gemini uses a contenteditable input; execCommand still works reliably there.
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, text);

    if (!editor.textContent?.trim()) {
      editor.textContent = text;
      editor.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
    }
  }

  function findSendButton() {
    const candidates = [
      ...document.querySelectorAll('button[aria-label]'),
    ];
    for (const btn of candidates) {
      const label = (btn.getAttribute("aria-label") || "").toLowerCase();
      if (
        label.includes("send") ||
        label.includes("submit") ||
        label.includes("отправить") ||
        label.includes("wyślij")
      ) {
        if (!btn.disabled) return btn;
      }
    }
    return null;
  }

  async function tryFill() {
    const editor = findEditor();
    if (!editor) return false;

    setEditorText(editor, prompt);
    await new Promise((r) => setTimeout(r, 150));

    const send = findSendButton();
    if (send) {
      send.click();
      return true;
    }

    // Fallback: press Enter in the editor
    editor.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      })
    );
    return true;
  }

  while (Date.now() < deadline) {
    if (await tryFill()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
})();
