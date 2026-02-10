# Acts Quiz Arcade (Web-First)

This is the refactored web-first version of the game, structured for future Capacitor wrapping.

## Run Locally (Windows, no build)
1. Open a terminal in this folder:
   - `cd app`
2. Start a local dev server:
   - `py -m http.server 5173`
3. Open in your browser:
   - `http://localhost:5173/`

If `py` is not available, try `python -m http.server 5173`.

## Project Structure
```
/app
  index.html
  /assets
    fairy-tale-loop-275534.mp3
    correct-156911.mp3
    correct-472358.mp3
    streak_popup_transparent.png
  /src
    main.js
    state.js
    storage.js
    audio.js
    ui.js
    confetti.js
    books.js
    styles.css
```
