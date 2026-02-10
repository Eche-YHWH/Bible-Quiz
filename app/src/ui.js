import { BOOK_ORDER, getBookData, resolveBookId, QUESTIONS_PER_LEVEL } from "./books.js";
import { ACTIONS, evaluateAnswer, computeRank } from "./state.js";

export function initUI({ store, audio, confetti, storage, initialBook }) {
  let activeBook = initialBook;
  let releaseFocus = null;
  let lastFocused = null;
  let lastSaveToastAt = 0;

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
    btnContinue: el("btnContinue"),
    btnAddGems: el("btnAddGems"),
    btnSound: el("btnSound"),
    bestScoreMenu: el("bestScoreMenu"),
    saveStatus: el("saveStatus"),
    saveMeta: el("saveMeta"),
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
    bookNodes: el("bookNodes"),
    selectedBookLabel: el("selectedBookLabel"),
    settingSound: el("settingSound"),
    settingMusic: el("settingMusic"),
    settingMusicValue: el("settingMusicValue"),
    settingFx: el("settingFx"),
    settingFxValue: el("settingFxValue"),
    settingMotion: el("settingMotion"),
  };

  const isVisible = (element) => element.classList.contains("is-visible");

  function trapFocus(container) {
    const focusable = Array.from(
      container.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((el) => !el.disabled && el.offsetParent !== null);

    if (focusable.length === 0) return () => {};
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKey = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
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
    for (let i = 0; i < 3; i++) {
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
    dom.statBookName.textContent = activeBook.title;
    dom.statLevelName.textContent = levelName;
    dom.statScore.textContent = String(state.run.score);
    dom.statStreak.textContent = String(state.run.streak);
    dom.bestScore.textContent = String(storage.getBestScore(activeBook.id));
    dom.rank.textContent = computeRank(state.run.score, activeBook.questions.length, activeBook.title);
    dom.gemCount.textContent = String(state.run.gemCount);
  }

  function setFeedback(type, html) {
    dom.feedback.classList.remove("hidden", "good", "bad");
    dom.feedback.classList.add("feedback", "show", type === "good" ? "good" : "bad");
    dom.feedback.innerHTML = html;
  }

  function lockChoices() {
    dom.choices.querySelectorAll("button").forEach((b) => (b.disabled = true));
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

    const q = activeBook.questions[Math.min(store.getState().run.idx, activeBook.questions.length - 1)];
    setFeedback(
      won ? "good" : "bad",
      `${won ? `<div class="value">You cleared ${activeBook.title} Quiz Arcade!</div>` : `<div class="value">Game over.</div>`}
       <div class="menu-meta">Final score: <span class="value">${score}</span></div>
       <div class="menu-meta">Rank: <span class="value">${computeRank(score, activeBook.questions.length, activeBook.title)}</span></div>
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
    saveRun();
  }

  function showMenu() {
    store.dispatch({ type: ACTIONS.SET_PAUSED, paused: false });
    closeDialog(dom.bookMap);
    closeDialog(dom.pause);
    closeDialog(dom.modal);
    closeDialog(dom.streakPop);

    const saved = storage.readSave();
    const lastBookId = resolveBookId(storage.getLastBook());
    const savedBookId = saved ? resolveBookId(saved.bookId) : null;
    const menuBookId = savedBookId || lastBookId;
    const menuBook = getBookData(menuBookId);

    dom.bestScoreMenu.textContent = String(storage.getBestScore(menuBookId));

    if (saved && !saved.finished && saved.lives > 0) {
      const total = saved.total ?? menuBook.questions.length;
      if (saved.idx < total) {
        dom.saveStatus.textContent = `${menuBook.title}: Q ${saved.idx + 1}/${total}`;
        dom.saveMeta.textContent = `Score ${saved.score} · Lives ${saved.lives}`;
        dom.btnContinue.disabled = false;
      } else {
        dom.saveStatus.textContent = "None";
        dom.saveMeta.textContent = "";
        dom.btnContinue.disabled = true;
      }
    } else {
      dom.saveStatus.textContent = "None";
      dom.saveMeta.textContent = "";
      dom.btnContinue.disabled = true;
    }

    openDialog(dom.menu);
  }

  function renderBookMap() {
    dom.bookNodes.innerHTML = "";
    BOOK_ORDER.forEach((id, index) => {
      const book = getBookData(id);
      const wrap = document.createElement("div");
      wrap.className = "book-node-wrap";
      wrap.style.left = `${book.pos.x}%`;
      wrap.style.top = `${book.pos.y}%`;

      const btn = document.createElement("button");
      btn.className = "book-node";
      if (id === activeBook.id) btn.classList.add("active");
      btn.setAttribute("aria-label", book.title);
      btn.title = book.title;
      btn.textContent = String(index + 1);
      btn.addEventListener("click", () => startNewGameWithBook(id));

      const label = document.createElement("div");
      label.className = "book-label";
      label.textContent = book.title;

      wrap.appendChild(btn);
      wrap.appendChild(label);
      dom.bookNodes.appendChild(wrap);
    });

    const lastId = resolveBookId(storage.getLastBook());
    dom.selectedBookLabel.textContent = `Last: ${getBookData(lastId).title}`;
  }

  function showBookMap() {
    renderBookMap();
    openDialog(dom.bookMap);
  }

  function startNewGameWithBook(bookId) {
    setActiveBook(bookId);
    storage.setLastBook(activeBook.id);
    storage.clearSave();
    resetRun();
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
    closeDialog(dom.menu);
    audio.playMusic();
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

  function handleKey(e) {
    const tag = (e.target && e.target.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

    if (isVisible(dom.streakPop)) {
      hideStreakPopup();
      return;
    }

    if (e.key === "Escape") {
      if (isVisible(dom.modal)) {
        closeDialog(dom.modal);
        return;
      }
      if (isVisible(dom.pause)) {
        closePause();
        return;
      }
      if (isVisible(dom.menu) || isVisible(dom.bookMap)) return;
      togglePause();
      return;
    }

    const state = store.getState();
    if (state.paused || isVisible(dom.menu) || isVisible(dom.bookMap) || isVisible(dom.modal)) return;

    const k = e.key.toUpperCase();
    if (!state.run.answered && ["A", "B", "C", "D"].includes(k)) {
      const btns = Array.from(dom.choices.querySelectorAll("button"));
      const idx = ["A", "B", "C", "D"].indexOf(k);
      if (btns[idx]) btns[idx].click();
    } else if (state.run.answered && (e.key === "Enter" || e.key === " ")) {
      dom.btnNext.click();
    }
  }

  dom.streakPop.addEventListener("click", hideStreakPopup);
  dom.streakPopImg.addEventListener("click", hideStreakPopup);

  dom.btnNext.addEventListener("click", next);
  dom.btnRestart.addEventListener("click", () => {
    storage.clearSave();
    resetRun();
    audio.playMusic();
  });

  dom.btnReset.addEventListener("click", showMenu);
  dom.btnPause.addEventListener("click", togglePause);

  dom.btnResume.addEventListener("click", closePause);
  dom.btnPauseRestart.addEventListener("click", () => {
    closePause();
    storage.clearSave();
    resetRun();
    audio.playMusic();
  });
  dom.btnPauseMenu.addEventListener("click", () => {
    closePause();
    showMenu();
  });

  dom.btnNewGame.addEventListener("click", () => {
    closeDialog(dom.menu);
    showBookMap();
  });
  dom.btnContinue.addEventListener("click", startContinue);
  dom.btnCloseMap.addEventListener("click", () => {
    closeDialog(dom.bookMap);
    showMenu();
  });

  dom.btnAddGems.addEventListener("click", () => {
    store.dispatch({ type: ACTIONS.ADD_GEMS, amount: 25 });
    renderMeta();
    saveRun({ silent: true });
    confetti(store.getState().settings.reduceMotion);
    audio.beep("level");
    showToast("+25 gems");
  });

  dom.btnHow.addEventListener("click", () => openDialog(dom.modal));
  dom.btnClose.addEventListener("click", () => closeDialog(dom.modal));
  dom.modal.addEventListener("click", (e) => {
    if (e.target === dom.modal) closeDialog(dom.modal);
  });
  dom.pause.addEventListener("click", (e) => {
    if (e.target === dom.pause) closePause();
  });

  dom.btnSound.addEventListener("click", () => {
    const enabled = !store.getState().settings.sound;
    updateSettings({ sound: enabled });
    showToast(enabled ? "Sound on" : "Sound off");
  });

  dom.settingSound.addEventListener("change", (e) => {
    updateSettings({ sound: e.target.checked });
    showToast(e.target.checked ? "Sound on" : "Sound off");
  });

  dom.settingMusic.addEventListener("input", (e) => {
    const value = Number(e.target.value);
    dom.settingMusicValue.textContent = value;
    updateSettings({ musicVolume: value });
  });

  dom.settingFx.addEventListener("input", (e) => {
    const value = Number(e.target.value);
    dom.settingFxValue.textContent = value;
    updateSettings({ fxVolume: value });
  });

  dom.settingMotion.addEventListener("change", (e) => {
    updateSettings({ reduceMotion: e.target.checked });
    showToast(e.target.checked ? "Reduce motion on" : "Reduce motion off");
  });

  window.addEventListener("keydown", handleKey);

  applySettings(store.getState().settings);
  renderQuestion();
  renderMeta();
  renderProgress();
  renderLives();
  showMenu();

  return {
    setActiveBook,
    showMenu,
  };
}
