const BEST_KEY_PREFIX = "acts_quiz_best_v3_";
const SAVE_KEY = "acts_quiz_save_v3";
const LAST_BOOK_KEY = "acts_quiz_last_book_v3";
const SETTINGS_KEY = "acts_quiz_settings_v3";

export function getBestScore(bookId) {
  try {
    const key = `${BEST_KEY_PREFIX}${bookId}`;
    const stored = localStorage.getItem(key);
    if (stored !== null) return Number(stored);
    if (bookId === "acts") {
      const legacy = localStorage.getItem("acts_quiz_best_v3");
      if (legacy !== null) {
        localStorage.setItem(key, legacy);
        return Number(legacy);
      }
    }
  } catch {}
  return 0;
}

export function setBestScore(bookId, score) {
  try {
    localStorage.setItem(`${BEST_KEY_PREFIX}${bookId}`, String(score));
  } catch {}
}

export function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSave(payload) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {}
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}

export function getLastBook() {
  try {
    return localStorage.getItem(LAST_BOOK_KEY);
  } catch {
    return null;
  }
}

export function setLastBook(bookId) {
  try {
    localStorage.setItem(LAST_BOOK_KEY, bookId);
  } catch {}
}

export function readSettings(defaults) {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function writeSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
