import {
  BOOKS,
  BOOK_DIRECTORY,
  MAP_GROUPS,
  getBookData,
  resolveBookId,
  QUESTIONS_PER_LEVEL,
} from "./books.js";
import { ACTIONS, evaluateAnswer, computeRank } from "./state.js";

const PLAYABLE_BOOK_IDS = new Set(
  Object.entries(BOOKS)
    .filter(([, book]) => !book.locked && Array.isArray(book.questions) && book.questions.length > 0)
    .map(([bookId]) => bookId)
);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getBookTitle(bookId) {
  return BOOKS[bookId]?.title || BOOK_DIRECTORY[bookId]?.title || "Unknown Book";
}

function getMapGroup(groupId) {
  return MAP_GROUPS.find((group) => group.id === groupId) || null;
}

function isBookPlayable(bookId) {
  return PLAYABLE_BOOK_IDS.has(bookId);
}

export function initUI({ store, audio, confetti, storage, initialBook }) {
  let activeBook = initialBook;
  let releaseFocus = null;
  let lastFocused = null;
  let lastSaveToastAt = 0;
  let selectedMapGroupId = null;

  const el = (id) => document.getElementById(id);
  const dom = {
    body: document.body,
    confetti: el("confetti"),
    menu: el("menu"),
    bookMap: el("bookMap"),
    pause: el("pause"),
    modal: el("modal"),
    streakPop: el("streakPop"),
    streakPopImg: el("streakPopImg"),
    toastHost: el("toastHost"),
    qText: el("qText"),
    choices: el("choices"),
    feedback: el("feedback"),
    btnNext: el("btnNext"),
    btnRestart: el("btnRestart"),
    btnReset: el("btnReset"),
    btnPause: el("btnPause"),
    btnHow: el("btnHow"),
    btnClose: el("btnClose"),
    btnCloseMap: el("btnCloseMap"),
    btnResume: el("btnResume"),
    btnPauseRestart: el("btnPauseRestart"),
    btnPauseMenu: el("btnPauseMenu"),
    btnNewGame: el("btnNewGame"),
    btnOpenMap: el("btnOpenMap"),
    btnContinue: el("btnContinue"),
    continueButtonNote: el("continueButtonNote"),
    btnAddGems: el("btnAddGems"),
    btnMenuAddGems: el("btnMenuAddGems"),
    btnMenuSettings: el("btnMenuSettings"),
    btnSound: el("btnSound"),
    btnResetMapZoom: el("btnResetMapZoom"),
    btnResetMapTray: el("btnResetMapTray"),
    btnNavHome: el("btnNavHome"),
    btnNavQuests: el("btnNavQuests"),
    btnNavRankings: el("btnNavRankings"),
    btnNavProfile: el("btnNavProfile"),
    menuGemCount: el("menuGemCount"),
    menuLastBook: el("menuLastBook"),
    menuLastLevel: el("menuLastLevel"),
    menuLastScore: el("menuLastScore"),
    menuLastLives: el("menuLastLives"),
    menuLastProgressFill: el("menuLastProgressFill"),
    menuLastProgressText: el("menuLastProgressText"),
    menuLastStatus: el("menuLastStatus"),
    statBookName: el("statBookName"),
    statProgress: el("statProgress"),
    statLevelName: el("statLevelName"),
    statLives: el("statLives"),
    statScore: el("statScore"),
    statStreak: el("statStreak"),
    bestScore: el("bestScore"),
    rank: el("rank"),
    gemCount: el("gemCount"),
    progressFill: el("progressFill"),
    mapCanvas: el("mapCanvas"),
    groupHotspots: el("groupHotspots"),
    mapHint: el("mapHint"),
    mapTray: el("mapTray"),
    mapGroupTitle: el("mapGroupTitle"),
    mapGroupCaption: el("mapGroupCaption"),
    mapBookButtons: el("mapBookButtons"),
    settingSound: el("settingSound"),
    settingMusic: el("settingMusic"),
    settingMusicValue: el("settingMusicValue"),
    settingFx: el("settingFx"),
    settingFxValue: el("settingFxValue"),
    settingMotion: el("settingMotion"),
  };

  const isVisible = (element) => element && element.classList.contains("is-visible");

  function trapFocus(container) {
    const focusable = Array.from(
      container.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((node) => !node.disabled && node.offsetParent !== null);

    if (focusable.length === 0) return () => {};

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKey = (event) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKey);
    first.focus();

    return () => container.removeEventListener("keydown", onKey);
  }

  function openDialog(container) {
    if (!container) return;
    lastFocused = document.activeElement;
    container.classList.add("is-visible");
    container.setAttribute("aria-hidden", "false");
    releaseFocus?.();
    releaseFocus = trapFocus(container);
  }

  function closeDialog(container) {
    if (!container) return;
    container.classList.remove("is-visible");
    container.setAttribute("aria-hidden", "true");
    releaseFocus?.();
    releaseFocus = null;

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }

    lastFocused = null;
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    dom.toastHost.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
  }

  function maybeToastSave() {
    const now = Date.now();
    if (now - lastSaveToastAt > 5000) {
      showToast("Saved");
      lastSaveToastAt = now;
    }
  }

  function setActiveBook(bookId) {
    activeBook = getBookData(bookId);
    store.dispatch({ type: ACTIONS.SET_BOOK, bookId: activeBook.id });
  }

  function applySettings(settings) {
    dom.settingSound.checked = settings.sound;
    dom.settingMusic.value = settings.musicVolume;
    dom.settingMusicValue.textContent = settings.musicVolume;
    dom.settingFx.value = settings.fxVolume;
    dom.settingFxValue.textContent = settings.fxVolume;
    dom.settingMotion.checked = settings.reduceMotion;
    dom.btnSound.textContent = settings.sound ? "Sound: On" : "Sound: Off";
    dom.btnSound.setAttribute("aria-pressed", settings.sound ? "true" : "false");
    dom.body.classList.toggle("reduce-motion", settings.reduceMotion);
    audio.applySettings(settings);
  }

  function updateSettings(partial) {
    store.dispatch({ type: ACTIONS.SET_SETTINGS, settings: partial });
    const settings = store.getState().settings;
    storage.writeSettings(settings);
    applySettings(settings);
  }

  function renderLives() {
    const { lives } = store.getState().run;
    dom.statLives.innerHTML = "";

    for (let i = 0; i < 3; i += 1) {
      const span = document.createElement("span");
      span.textContent = i < lives ? "❤️" : "🖤";
      dom.statLives.appendChild(span);
    }
  }

  function renderProgress() {
    const total = activeBook.questions.length;
    const current = Math.min(store.getState().run.idx + 1, total);
    const pct = total ? Math.round(((current - 1) / total) * 100) : 0;
    dom.progressFill.style.width = `${pct}%`;
    dom.statProgress.textContent = `${current}/${total}`;
  }

  function renderMeta() {
    const state = store.getState();
    const q = activeBook.questions[state.run.idx] || activeBook.questions[0];
    const levelName = q ? activeBook.levels[q.level]?.name || `Level ${q.level}` : "No questions";
    const gems = String(state.run.gemCount);

    dom.statBookName.textContent = activeBook.title;
    dom.statLevelName.textContent = levelName;
    dom.statScore.textContent = String(state.run.score);
    dom.statStreak.textContent = String(state.run.streak);
    dom.bestScore.textContent = String(storage.getBestScore(activeBook.id));
    dom.rank.textContent = computeRank(state.run.score, activeBook.questions.length, activeBook.title);
    dom.gemCount.textContent = gems;
    dom.menuGemCount.textContent = gems;
  }

  function renderMenu() {
    const saved = storage.readSave();
    const hasSavedRun =
      saved && !saved.finished && saved.lives > 0 && typeof saved.idx === "number" && saved.idx < saved.total;
    const lastBookId = resolveBookId((hasSavedRun && saved.bookId) || storage.getLastBook());
    const lastBook = getBookData(lastBookId);
    const totalQuestions = hasSavedRun ? saved.total || lastBook.questions.length : lastBook.questions.length;
    const currentQuestion = hasSavedRun ? Math.min(saved.idx + 1, totalQuestions) : 0;
    const levelIndex = hasSavedRun ? Math.floor(saved.idx / QUESTIONS_PER_LEVEL) + 1 : 1;
    const score = hasSavedRun ? saved.score || 0 : storage.getBestScore(lastBookId);
    const lives = hasSavedRun ? saved.lives || 3 : 3;
    const progressPct = totalQuestions ? Math.round((currentQuestion / totalQuestions) * 100) : 0;

    dom.menuGemCount.textContent = String(store.getState().run.gemCount);
    dom.menuLastBook.textContent = lastBook.title;
    dom.menuLastLevel.textContent = hasSavedRun ? `Level ${levelIndex}` : "Ready for a fresh start";
    dom.menuLastScore.textContent = String(score);
    dom.menuLastLives.textContent = String(lives);
    dom.menuLastProgressFill.style.width = `${progressPct}%`;
    dom.menuLastProgressText.textContent = `${currentQuestion}/${totalQuestions}`;
    dom.menuLastStatus.textContent = hasSavedRun
      ? `Saved progress in ${lastBook.title}`
      : `Best score in ${lastBook.title}: ${storage.getBestScore(lastBookId)}`;
    dom.continueButtonNote.textContent = hasSavedRun
      ? `Continue in ${lastBook.title}`
      : "No saved journey yet";
    dom.btnContinue.disabled = !hasSavedRun;
  }

  function setFeedback(type, html) {
    dom.feedback.classList.remove("hidden", "good", "bad");
    dom.feedback.classList.add("feedback", "show", type === "good" ? "good" : "bad");
    dom.feedback.innerHTML = html;
  }

  function lockChoices() {
    dom.choices.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
  }

  function renderQuestion() {
    const q = activeBook.questions[store.getState().run.idx];
    dom.feedback.classList.add("hidden");
    dom.btnNext.classList.add("hidden");
    dom.btnRestart.classList.add("hidden");

    if (!q) {
      dom.qText.textContent = "No questions loaded.";
      dom.choices.innerHTML = "";
      renderLives();
      renderProgress();
      renderMeta();
      return;
    }

    dom.qText.textContent = q.question;
    dom.choices.innerHTML = "";

    ["A", "B", "C", "D"].forEach((letter) => {
      const label = q.options[letter];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer";
      btn.textContent = `${letter}. ${label}`;
      btn.addEventListener("click", () => answer(letter));
      dom.choices.appendChild(btn);
    });

    renderLives();
    renderProgress();
    renderMeta();
  }

  function showStreakPopup() {
    dom.streakPopImg.classList.remove("pop-in");
    void dom.streakPopImg.offsetWidth;
    dom.streakPopImg.classList.add("pop-in");
    openDialog(dom.streakPop);
  }

  function hideStreakPopup() {
    closeDialog(dom.streakPop);
  }

  function saveRun(options = {}) {
    const state = store.getState();

    storage.writeSave({
      bookId: activeBook.id,
      idx: state.run.idx,
      score: state.run.score,
      lives: state.run.lives,
      streak: state.run.streak,
      finished: state.run.finished,
      gemCount: state.run.gemCount,
      total: activeBook.questions.length,
    });

    renderMenu();

    if (!options.silent) maybeToastSave();
  }

  function endGame(won) {
    store.dispatch({ type: ACTIONS.SET_FINISHED, finished: true });
    storage.clearSave();
    dom.btnNext.classList.add("hidden");
    dom.choices.innerHTML = "";

    const best = storage.getBestScore(activeBook.id);
    const score = store.getState().run.score;
    if (score > best) storage.setBestScore(activeBook.id, score);

    renderMeta();
    renderMenu();

    const q = activeBook.questions[Math.min(store.getState().run.idx, activeBook.questions.length - 1)];
    setFeedback(
      won ? "good" : "bad",
      `${
        won
          ? `<div class="value">You cleared ${activeBook.title} Quiz Arcade!</div>`
          : `<div class="value">Game over.</div>`
      }
       <div class="menu-meta">Final score: <span class="value">${score}</span></div>
       <div class="menu-meta">Rank: <span class="value">${computeRank(
         score,
         activeBook.questions.length,
         activeBook.title
       )}</span></div>
       <div class="menu-meta">Last reference shown: ${q.ref}</div>`
    );

    dom.btnRestart.classList.remove("hidden");
    confetti(store.getState().settings.reduceMotion);
  }

  function answer(letter) {
    const state = store.getState();
    if (state.run.answered || state.run.finished || state.paused) return;

    const q = activeBook.questions[state.run.idx];
    if (!q) return;

    const correct = letter === q.answer;
    const outcome = evaluateAnswer(state.run, correct);

    store.dispatch({ type: ACTIONS.ANSWER, correct });
    lockChoices();

    if (correct) {
      if (outcome.bonus) {
        setFeedback("good", `<div class="value">Correct! +10</div><div class="menu-meta">Streak bonus: +5</div>`);
        audio.playFX("streak");
        showStreakPopup();
        confetti(store.getState().settings.reduceMotion);
      } else {
        setFeedback("good", `<div class="value">Correct! +10</div>`);
        audio.playFX("correct");
      }
    } else {
      const correctText = q.options[q.answer];
      setFeedback(
        "bad",
        `<div class="value">Wrong. -1 life</div><div class="menu-meta">Correct: <span class="value">${q.answer}. ${correctText}</span></div><div class="menu-meta">Reference: ${q.ref}</div>`
      );

      if (!store.getState().settings.reduceMotion) {
        const card = dom.qText.closest("#paperCard");
        if (card) {
          card.classList.add("shake");
          setTimeout(() => card.classList.remove("shake"), 380);
        }
      }

      audio.beep("bad");
    }

    renderLives();
    renderMeta();

    if (store.getState().run.lives <= 0) {
      endGame(false);
      return;
    }

    const nextIdx = store.getState().run.idx + 1;
    if (nextIdx % QUESTIONS_PER_LEVEL === 0 && nextIdx < activeBook.questions.length) {
      audio.beep("level");
      confetti(store.getState().settings.reduceMotion);
    }

    dom.btnNext.classList.remove("hidden");
    saveRun();
  }

  function next() {
    const state = store.getState();
    if (!state.run.answered || state.run.finished || state.paused) return;

    store.dispatch({ type: ACTIONS.NEXT });

    if (store.getState().run.idx >= activeBook.questions.length) {
      endGame(true);
      return;
    }

    renderQuestion();
    saveRun();
  }

  function resetRun() {
    store.dispatch({ type: ACTIONS.RESET_RUN });
    renderQuestion();
    renderMenu();
    saveRun();
  }

  function applyMapTransform(group) {
    if (!group) {
      dom.mapCanvas.style.setProperty("--map-scale", "1");
      dom.mapCanvas.style.setProperty("--map-shift-x", "0%");
      dom.mapCanvas.style.setProperty("--map-shift-y", "0%");
      return;
    }

    const { x, y, scale } = group.focus;
    const minShift = 100 - scale * 100;
    const shiftX = clamp(50 - x * scale, minShift, 0);
    const shiftY = clamp(50 - y * scale, minShift, 0);

    dom.mapCanvas.style.setProperty("--map-scale", String(scale));
    dom.mapCanvas.style.setProperty("--map-shift-x", `${shiftX}%`);
    dom.mapCanvas.style.setProperty("--map-shift-y", `${shiftY}%`);
  }

  function renderGroupHotspots() {
    dom.groupHotspots.innerHTML = "";

    MAP_GROUPS.forEach((group) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "map-group-spot";
      if (group.id === selectedMapGroupId) btn.classList.add("is-active");
      btn.style.left = `${group.spot.left}%`;
      btn.style.top = `${group.spot.top}%`;
      btn.style.width = `${group.spot.width}%`;
      btn.style.height = `${group.spot.height}%`;
      btn.title = group.title;
      btn.setAttribute("aria-label", `Zoom to ${group.title}`);
      btn.addEventListener("click", () => setSelectedMapGroup(group.id));
      dom.groupHotspots.appendChild(btn);
    });
  }

  function renderMapTray() {
    const group = getMapGroup(selectedMapGroupId);

    if (!group) {
      dom.mapTray.classList.add("hidden");
      dom.btnResetMapZoom.classList.add("hidden");
      dom.btnResetMapTray.classList.add("hidden");
      dom.mapGroupTitle.textContent = "Choose a region";
      dom.mapGroupCaption.textContent = "Each banner zooms in to its book group.";
      dom.mapBookButtons.innerHTML = "";
      dom.mapHint.textContent = "Tap a region banner to zoom in.";
      return;
    }

    const playableCount = group.books.filter((bookId) => isBookPlayable(bookId)).length;

    dom.mapTray.classList.remove("hidden");
    dom.btnResetMapZoom.classList.remove("hidden");
    dom.btnResetMapTray.classList.remove("hidden");
    dom.mapGroupTitle.textContent = group.title;
    dom.mapGroupCaption.textContent =
      playableCount === group.books.length
        ? "Every book in this group is ready to play."
        : `${playableCount} ready now • ${group.books.length - playableCount} coming soon`;
    dom.mapHint.textContent = `Choose a book from ${group.title}.`;
    dom.mapBookButtons.innerHTML = "";

    group.books.forEach((bookId) => {
      const playable = isBookPlayable(bookId);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `map-book-button${playable ? "" : " locked"}`;
      btn.innerHTML = `<span class="map-book-name">${getBookTitle(bookId)}</span><span class="map-book-note">${
        playable ? "Play now" : "Coming soon"
      }</span>`;
      btn.addEventListener("click", () => {
        if (playable) {
          startNewGameWithBook(bookId);
        } else {
          showToast(`${getBookTitle(bookId)} is coming soon.`);
        }
      });
      dom.mapBookButtons.appendChild(btn);
    });
  }

  function resetMapZoom() {
    selectedMapGroupId = null;
    applyMapTransform(null);
    renderGroupHotspots();
    renderMapTray();
  }

  function setSelectedMapGroup(groupId) {
    selectedMapGroupId = groupId;
    const group = getMapGroup(groupId);
    applyMapTransform(group);
    renderGroupHotspots();
    renderMapTray();
  }

  function showMenu() {
    store.dispatch({ type: ACTIONS.SET_PAUSED, paused: false });
    closeDialog(dom.bookMap);
    closeDialog(dom.pause);
    closeDialog(dom.modal);
    closeDialog(dom.streakPop);
    resetMapZoom();
    renderMenu();
    openDialog(dom.menu);
  }

  function showBookMap() {
    resetMapZoom();
    closeDialog(dom.menu);
    renderGroupHotspots();
    openDialog(dom.bookMap);
  }

  function startNewGameWithBook(bookId) {
    if (!isBookPlayable(bookId)) {
      showToast(`${getBookTitle(bookId)} is coming soon.`);
      return;
    }

    resetMapZoom();
    setActiveBook(bookId);
    storage.setLastBook(activeBook.id);
    storage.clearSave();
    store.dispatch({ type: ACTIONS.RESET_RUN });
    renderQuestion();
    renderMenu();
    closeDialog(dom.bookMap);
    closeDialog(dom.menu);
    audio.playMusic();
  }

  function startContinue() {
    const saved = storage.readSave();
    if (!saved || saved.finished || saved.lives <= 0) return;

    const savedBookId = resolveBookId(saved.bookId);
    setActiveBook(savedBookId);
    storage.setLastBook(savedBookId);

    store.dispatch({
      type: ACTIONS.LOAD_RUN,
      payload: {
        idx: saved.idx ?? 0,
        score: saved.score ?? 0,
        lives: saved.lives ?? 3,
        streak: saved.streak ?? 0,
        finished: !!saved.finished,
        gemCount: saved.gemCount ?? 9999,
      },
    });

    renderQuestion();
    renderMenu();
    closeDialog(dom.menu);
    audio.playMusic();
  }

  function awardBonusGems() {
    store.dispatch({ type: ACTIONS.ADD_GEMS, amount: 25 });
    renderMeta();
    renderMenu();
    saveRun({ silent: true });
    confetti(store.getState().settings.reduceMotion);
    audio.beep("level");
    showToast("+25 gems");
  }

  function openPause() {
    store.dispatch({ type: ACTIONS.SET_PAUSED, paused: true });
    openDialog(dom.pause);
  }

  function closePause() {
    store.dispatch({ type: ACTIONS.SET_PAUSED, paused: false });
    closeDialog(dom.pause);
  }

  function togglePause() {
    if (isVisible(dom.pause)) {
      closePause();
      return;
    }

    if (isVisible(dom.menu) || isVisible(dom.bookMap) || isVisible(dom.modal)) return;
    openPause();
  }

  function handleKey(event) {
    const tag = (event.target && event.target.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

    if (isVisible(dom.streakPop)) {
      hideStreakPopup();
      return;
    }

    if (event.key === "Escape") {
      if (isVisible(dom.modal)) {
        closeDialog(dom.modal);
        return;
      }

      if (isVisible(dom.pause)) {
        closePause();
        return;
      }

      if (isVisible(dom.bookMap) && selectedMapGroupId) {
        resetMapZoom();
        return;
      }

      if (isVisible(dom.menu) || isVisible(dom.bookMap)) return;
      togglePause();
      return;
    }

    const state = store.getState();
    if (state.paused || isVisible(dom.menu) || isVisible(dom.bookMap) || isVisible(dom.modal)) return;

    const key = event.key.toUpperCase();
    if (!state.run.answered && ["A", "B", "C", "D"].includes(key)) {
      const btns = Array.from(dom.choices.querySelectorAll("button"));
      const idx = ["A", "B", "C", "D"].indexOf(key);
      if (btns[idx]) btns[idx].click();
    } else if (state.run.answered && (event.key === "Enter" || event.key === " ")) {
      dom.btnNext.click();
    }
  }

  dom.streakPop.addEventListener("click", hideStreakPopup);
  dom.streakPopImg.addEventListener("click", hideStreakPopup);

  dom.btnNext.addEventListener("click", next);
  dom.btnRestart.addEventListener("click", () => {
    storage.clearSave();
    renderMenu();
    resetRun();
    audio.playMusic();
  });

  dom.btnReset.addEventListener("click", showMenu);
  dom.btnPause.addEventListener("click", togglePause);

  dom.btnResume.addEventListener("click", closePause);
  dom.btnPauseRestart.addEventListener("click", () => {
    closePause();
    storage.clearSave();
    renderMenu();
    resetRun();
    audio.playMusic();
  });
  dom.btnPauseMenu.addEventListener("click", () => {
    closePause();
    showMenu();
  });

  dom.btnNewGame.addEventListener("click", showBookMap);
  dom.btnOpenMap.addEventListener("click", showBookMap);
  dom.btnContinue.addEventListener("click", startContinue);
  dom.btnCloseMap.addEventListener("click", showMenu);
  dom.btnResetMapZoom.addEventListener("click", resetMapZoom);
  dom.btnResetMapTray.addEventListener("click", resetMapZoom);

  dom.btnAddGems.addEventListener("click", awardBonusGems);
  dom.btnMenuAddGems.addEventListener("click", awardBonusGems);

  dom.btnHow.addEventListener("click", () => openDialog(dom.modal));
  dom.btnMenuSettings.addEventListener("click", () => openDialog(dom.modal));
  dom.btnClose.addEventListener("click", () => closeDialog(dom.modal));
  dom.modal.addEventListener("click", (event) => {
    if (event.target === dom.modal) closeDialog(dom.modal);
  });
  dom.pause.addEventListener("click", (event) => {
    if (event.target === dom.pause) closePause();
  });

  dom.btnSound.addEventListener("click", () => {
    const enabled = !store.getState().settings.sound;
    updateSettings({ sound: enabled });
    showToast(enabled ? "Sound on" : "Sound off");
  });

  dom.settingSound.addEventListener("change", (event) => {
    updateSettings({ sound: event.target.checked });
    showToast(event.target.checked ? "Sound on" : "Sound off");
  });

  dom.settingMusic.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    dom.settingMusicValue.textContent = value;
    updateSettings({ musicVolume: value });
  });

  dom.settingFx.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    dom.settingFxValue.textContent = value;
    updateSettings({ fxVolume: value });
  });

  dom.settingMotion.addEventListener("change", (event) => {
    updateSettings({ reduceMotion: event.target.checked });
    showToast(event.target.checked ? "Reduce motion on" : "Reduce motion off");
  });

  dom.btnNavHome.addEventListener("click", () => showToast("You are already home."));
  dom.btnNavQuests.addEventListener("click", () => showToast("Quests are coming soon."));
  dom.btnNavRankings.addEventListener("click", () =>
    showToast(`Best ${activeBook.title} score: ${storage.getBestScore(activeBook.id)}`)
  );
  dom.btnNavProfile.addEventListener("click", () => showToast("Profiles are coming soon."));

  window.addEventListener("keydown", handleKey);

  applySettings(store.getState().settings);
  renderQuestion();
  renderMeta();
  renderProgress();
  renderLives();
  renderGroupHotspots();
  renderMapTray();
  renderMenu();
  showMenu();

  return {
    setActiveBook,
    showMenu,
  };
}
