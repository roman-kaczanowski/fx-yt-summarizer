# YT --> Gemini Summarizer

Small Firefox extension for **local / personal use**. It adds a button that opens [Google Gemini](https://gemini.google.com/) in a new tab with a ready-made prompt to summarize the current YouTube video.

**This is not a published add-on.** There are no plans to submit it to Firefox Add-ons (AMO) or any other store. Load it temporarily (or permanently unsigned, at your own risk) from this folder.

## Features

- Toolbar popup with **Summarize in Gemini**
- Optional floating button on YouTube watch / Shorts / live pages
- Summary language: **EN / RU / PL**
- Toggle to hide the floating button (toolbar only)

## Install (temporary)

1. Open Firefox > `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `manifest.json` from this repository

Temporary add-ons are removed when Firefox restarts. Reload the extension from the same page after you pull changes.

## Usage

1. Sign in to Gemini in Firefox
2. Open a YouTube video
3. Pick a language (popup or the **EN/RU/PL** chip on the floating button)
4. Click **Summarize**

Gemini's UI changes sometimes; if auto-send fails, the prompt should still be in the input - press Enter.

## Permissions

- `storage` - language and floating-button preference
- `tabs` / `activeTab` - open Gemini and read the current tab URL
- Host access to YouTube and `gemini.google.com` - inject the floating button and fill the prompt

Nothing is sent to third-party servers by the extension itself. Prompts go only to Gemini in your browser session.

## License

MIT - see [LICENSE](LICENSE).
