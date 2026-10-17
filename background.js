import { PROMPTS, isYouTubeWatchUrl, normalizeLang, normalizeYouTubeUrl } from "./shared/prompts.js";

const PENDING_KEY = "pendingGeminiPrompt";

async function getLang() {
  const { summaryLang } = await browser.storage.local.get("summaryLang");
  return normalizeLang(summaryLang);
}

async function openGeminiSummary(videoUrl) {
  if (!isYouTubeWatchUrl(videoUrl)) {
    throw new Error("Not a YouTube video page");
  }

  const lang = await getLang();
  const prompt = PROMPTS[lang](normalizeYouTubeUrl(videoUrl));

  await browser.storage.session.set({ [PENDING_KEY]: prompt });
  await browser.tabs.create({ url: "https://gemini.google.com/app", active: true });
}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "summarize") {
    (async () => {
      try {
        let url = message.url;
        if (!url) {
          const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
          url = tab?.url;
        }
        await openGeminiSummary(url);
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || String(err) });
      }
    })();
    return true;
  }

  if (message?.type === "getPendingPrompt") {
    (async () => {
      const data = await browser.storage.session.get(PENDING_KEY);
      const prompt = data[PENDING_KEY] || null;
      if (prompt) {
        await browser.storage.session.remove(PENDING_KEY);
      }
      sendResponse({ prompt });
    })();
    return true;
  }

  return false;
});
