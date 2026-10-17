import { isYouTubeWatchUrl, normalizeLang } from "./shared/prompts.js";

const statusEl = document.getElementById("status");
const summarizeBtn = document.getElementById("summarize");
const floatingToggle = document.getElementById("show-floating");
const langButtons = [...document.querySelectorAll(".lang-btn")];

function setStatus(text, kind = "") {
  if (!text) {
    statusEl.hidden = true;
    statusEl.textContent = "";
    statusEl.className = "status";
    return;
  }
  statusEl.hidden = false;
  statusEl.textContent = text;
  statusEl.className = `status${kind ? ` ${kind}` : ""}`;
}

function paintLang(lang) {
  for (const btn of langButtons) {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  }
}

function paintFloating(show) {
  floatingToggle.setAttribute("aria-checked", String(show));
}

async function loadSettings() {
  const { summaryLang, showFloatingButton } = await browser.storage.local.get([
    "summaryLang",
    "showFloatingButton",
  ]);
  const lang = normalizeLang(summaryLang);
  const showFloating = showFloatingButton !== false;
  paintLang(lang);
  paintFloating(showFloating);
}

async function saveLang(lang) {
  await browser.storage.local.set({ summaryLang: lang });
  paintLang(lang);
}

async function currentTabUrl() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.url || "";
}

async function refreshContext() {
  const url = await currentTabUrl();
  const ok = isYouTubeWatchUrl(url);
  summarizeBtn.disabled = !ok;
  if (!ok) {
    setStatus("Open a YouTube video page first.", "error");
  } else {
    setStatus("");
  }
}

for (const btn of langButtons) {
  btn.addEventListener("click", async () => {
    await saveLang(btn.dataset.lang);
  });
}

floatingToggle.addEventListener("click", async () => {
  const next = floatingToggle.getAttribute("aria-checked") !== "true";
  paintFloating(next);
  await browser.storage.local.set({ showFloatingButton: next });
});

summarizeBtn.addEventListener("click", async () => {
  summarizeBtn.disabled = true;
  setStatus("Opening Gemini…");
  const response = await browser.runtime.sendMessage({ type: "summarize" });
  if (response?.ok) {
    setStatus("Done — check the new tab.", "ok");
    window.close();
  } else {
    setStatus(response?.error || "Could not open Gemini.", "error");
    await refreshContext();
  }
});

await loadSettings();
await refreshContext();
