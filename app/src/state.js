export const defaultSettings = {
  sound: true,
  musicVolume: 32,
  fxVolume: 90,
  reduceMotion: false,
};

export const ACTIONS = {
  RESET_RUN: "RESET_RUN",
  LOAD_RUN: "LOAD_RUN",
  ANSWER: "ANSWER",
  NEXT: "NEXT",
  SET_BOOK: "SET_BOOK",
  SET_PAUSED: "SET_PAUSED",
  SET_SETTINGS: "SET_SETTINGS",
  ADD_GEMS: "ADD_GEMS",
  SET_FINISHED: "SET_FINISHED",
};

export function freshRun() {
  return {
    idx: 0,
    score: 0,
    lives: 3,
    streak: 0,
    answered: false,
    finished: false,
    gemCount: 9999,
  };
}

export function freshState(settings = {}, bookId = "acts") {
  return {
    run: freshRun(),
    settings: { ...defaultSettings, ...settings },
    bookId,
    paused: false,
  };
}

export function applyAnswer(run, correct) {
  const next = { ...run, answered: true };
  if (correct) {
    next.score += 10;
    next.streak += 1;
    if (next.streak % 3 === 0) {
      next.score += 5;
    }
  } else {
    next.lives -= 1;
    next.streak = 0;
  }
  return next;
}

export function evaluateAnswer(run, correct) {
  const next = applyAnswer(run, correct);
  const bonus = correct && next.streak % 3 === 0;
  return { next, bonus };
}

export function computeRank(score, total, bookTitle) {
  const base = total * 10;
  if (base <= 0) return "Fresh Learner";
  if (score >= Math.round(base * 0.9)) return `${bookTitle} Grandmaster`;
  if (score >= Math.round(base * 0.7)) return "Kingdom Builder";
  if (score >= Math.round(base * 0.5)) return "Growing Disciple";
  return "Fresh Learner";
}

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.RESET_RUN:
      return { ...state, run: freshRun(), paused: false };
    case ACTIONS.LOAD_RUN:
      return {
        ...state,
        run: { ...freshRun(), ...action.payload, answered: false },
        paused: false,
      };
    case ACTIONS.ANSWER:
      return { ...state, run: applyAnswer(state.run, action.correct) };
    case ACTIONS.NEXT:
      return {
        ...state,
        run: { ...state.run, idx: state.run.idx + 1, answered: false },
      };
    case ACTIONS.SET_BOOK:
      return { ...state, bookId: action.bookId };
    case ACTIONS.SET_PAUSED:
      return { ...state, paused: action.paused };
    case ACTIONS.SET_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case ACTIONS.ADD_GEMS:
      return { ...state, run: { ...state.run, gemCount: state.run.gemCount + action.amount } };
    case ACTIONS.SET_FINISHED:
      return { ...state, run: { ...state.run, finished: action.finished } };
    default:
      return state;
  }
}

export function createStore(initial) {
  let state = initial;
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((fn) => fn(state, action));
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
