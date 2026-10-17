export const PROMPTS = {
  en: (url) =>
    `Please summarize this YouTube video clearly and concisely in English. Cover the main points, key arguments, and practical takeaways. Keep it structured and easy to skim.\n\nVideo: ${url}`,
  ru: (url) =>
    `Пожалуйста, сделай краткое и понятное саммари этого YouTube-видео на русском языке. Выдели основные мысли, ключевые аргументы и практические выводы. Структурируй ответ так, чтобы его было удобно быстро просмотреть.\n\nВидео: ${url}`,
  pl: (url) =>
    `Proszę o krótkie i przejrzyste podsumowanie tego filmu z YouTube po polsku. Wypunktuj główne myśli, kluczowe argumenty i praktyczne wnioski. Ułóż odpowiedź tak, żeby dało się ją szybko przejrzeć.\n\nFilm: ${url}`,
};

export const DEFAULT_LANG = "en";
export const LANGS = ["en", "ru", "pl"];

export function normalizeLang(lang) {
  return LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

export function nextLang(lang) {
  const i = LANGS.indexOf(normalizeLang(lang));
  return LANGS[(i + 1) % LANGS.length];
}

export function isYouTubeWatchUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be" && u.pathname.length > 1) return true;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch" && u.searchParams.has("v")) return true;
      if (u.pathname.startsWith("/shorts/")) return true;
      if (u.pathname.startsWith("/live/")) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function normalizeYouTubeUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/watch?v=${id}` : url;
    }
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/")[2];
      return id ? `https://www.youtube.com/watch?v=${id}` : url;
    }
    if (u.pathname === "/watch" && u.searchParams.has("v")) {
      return `https://www.youtube.com/watch?v=${u.searchParams.get("v")}`;
    }
    return url;
  } catch {
    return url;
  }
}
