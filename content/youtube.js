(function () {
  const BUTTON_ID = "ytg-summarize-btn";
  const LANGS = ["en", "ru", "pl"];

  function normalizeLang(lang) {
    return LANGS.includes(lang) ? lang : "en";
  }

  function nextLang(lang) {
    const i = LANGS.indexOf(normalizeLang(lang));
    return LANGS[(i + 1) % LANGS.length];
  }

  function isWatchPage() {
    const path = location.pathname;
    return (
      (path === "/watch" && new URLSearchParams(location.search).has("v")) ||
      path.startsWith("/shorts/") ||
      path.startsWith("/live/")
    );
  }

  async function getSettings() {
    const { summaryLang, showFloatingButton } = await browser.storage.local.get([
      "summaryLang",
      "showFloatingButton",
    ]);
    return {
      lang: normalizeLang(summaryLang),
      showFloating: showFloatingButton !== false,
    };
  }

  function labelFor(lang) {
    if (lang === "ru") return "Саммари";
    if (lang === "pl") return "Podsumuj";
    return "Summarize";
  }

  function titleFor(lang) {
    if (lang === "ru") return "Открыть Gemini с запросом саммари на русском";
    if (lang === "pl") return "Otwórz Gemini z prośbą o podsumowanie po polsku";
    return "Open Gemini with an English summary prompt";
  }

  async function ensureButton() {
    let btn = document.getElementById(BUTTON_ID);
    const { lang, showFloating } = await getSettings();

    if (!isWatchPage() || !showFloating) {
      btn?.remove();
      return;
    }

    if (!btn) {
      btn = document.createElement("button");
      btn.id = BUTTON_ID;
      btn.type = "button";
      btn.addEventListener("click", async (event) => {
        const langChip = event.target.closest?.(".ytg-lang");
        if (langChip) {
          event.stopPropagation();
          const { lang: current } = await getSettings();
          await browser.storage.local.set({ summaryLang: nextLang(current) });
          return;
        }

        btn.dataset.busy = "1";
        try {
          await browser.runtime.sendMessage({
            type: "summarize",
            url: location.href,
          });
        } finally {
          btn.dataset.busy = "0";
        }
      });
      document.documentElement.appendChild(btn);
    }

    btn.innerHTML = `${labelFor(lang)} <span class="ytg-lang" title="Switch EN/RU/PL">${lang.toUpperCase()}</span>`;
    btn.title = titleFor(lang);
  }

  ensureButton();

  // YouTube is an SPA — keep the button in sync with navigation.
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      ensureButton();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes.summaryLang || changes.showFloatingButton)) {
      ensureButton();
    }
  });
})();
