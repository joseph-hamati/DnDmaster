# Ember & Ink

A static, character-driven D&D campaign planner and live-voice AI Dungeon Master. It runs on GitHub Pages with no build step or server.

## Publish to GitHub Pages

1. Create a GitHub repository and push these files to its `main` branch.
2. In the repository, open **Settings → Pages**. Set **Build and deployment → Source** to **GitHub Actions**.
3. The included workflow deploys on every push to `main`. Open the Pages URL shown in the workflow or Pages settings.

For a project repository the URL is usually `https://YOUR-USERNAME.github.io/REPOSITORY/`. For a repository named `YOUR-USERNAME.github.io`, it is `https://YOUR-USERNAME.github.io/`.

## Play

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Open **API & voice settings** and paste your key. The key is stored in `sessionStorage`, so it lasts for that browser tab session; it is never bundled into the site.
3. Fill out the campaign brief, upload character sheets (PDF, PNG, JPEG, WebP, TXT, MD, or JSON), and select **Forge the campaign**.
4. Review the campaign bible, then select **Play this world**. Select **Begin adventure** and allow microphone access. A headset helps avoid echo.
5. End the live connection when you finish playing. The app saves that session's chronicle and creates an AI recap. Use **+ New session** when you return for the next game. The live DM receives the original campaign bible, earlier session recaps, and the current session's notes and recent chronicle.
6. Use **Export save** to keep a portable JSON backup of the world and all sessions. **Import save** restores it in another browser or device. The API key is never included in the export.

The campaign bible, session chronicle, notes, and recaps are stored locally in your browser. They are not synced by GitHub Pages, so export a save before clearing browser data or changing devices. Uploaded sheet files are held in memory until you refresh the page, and sent to Gemini when you forge a campaign. The planning and voice model names are editable in Settings because preview model availability can change.

## Key security

GitHub Pages serves public files. Do **not** put a private API key in the repository, workflow, or source code. Each visitor must enter their own key. The browser sends it directly to Google's Gemini API. If you want visitors to use an owner-paid key, add a trusted backend that issues [short-lived Gemini Live tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens) and proxies planning requests. A static GitHub Pages site alone cannot keep an owner key secret.

## Browser requirements

Use a current Chromium, Firefox, or Safari browser over HTTPS. Live voice needs microphone permission and Web Audio support. Gemini usage may incur charges under the key owner's plan.
