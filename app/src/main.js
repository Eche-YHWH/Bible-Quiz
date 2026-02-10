import { defaultSettings, freshState, createStore } from "./state.js";
import { getBookData, resolveBookId } from "./books.js";
import * as storage from "./storage.js";
import { AudioManager } from "./audio.js";
import { createConfetti } from "./confetti.js";
import { initUI } from "./ui.js";

const settings = storage.readSettings(defaultSettings);
const initialBookId = resolveBookId(storage.getLastBook());
const initialBook = getBookData(initialBookId);

storage.setLastBook(initialBookId);

const store = createStore(freshState(settings, initialBookId));
const audio = new AudioManager({
  bgSrc: "./assets/fairy-tale-loop-275534.mp3",
  fxSources: {
    correct: "./assets/correct-156911.mp3",
    streak: "./assets/correct-472358.mp3",
  },
});
audio.applySettings(settings);
audio.bindUnlock(document);

const confetti = createConfetti(document.getElementById("confetti"));

initUI({ store, audio, confetti, storage, initialBook });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
