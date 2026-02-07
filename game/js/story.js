// story.js — ストーリー進行・約束の秘密の解放

import { STORY_HINTS, OPENING_TEXTS, ENDING_TEXTS } from './data.js';
import { getLevel, isSecretFound } from './dolls.js';

const state = {
  revealedHints: new Set(),
  openingIndex: 0,
  endingIndex: 0,
  openingComplete: false,
};

export function getOpeningTexts() {
  return OPENING_TEXTS;
}

export function getOpeningIndex() {
  return state.openingIndex;
}

export function advanceOpening() {
  state.openingIndex++;
  if (state.openingIndex >= OPENING_TEXTS.length) {
    state.openingComplete = true;
    return null;
  }
  return OPENING_TEXTS[state.openingIndex];
}

export function isOpeningComplete() {
  return state.openingComplete;
}

export function checkNewHint() {
  const level = getLevel();
  const hint = STORY_HINTS.find(h => h.level === level && !state.revealedHints.has(h.level));
  if (hint) {
    state.revealedHints.add(hint.level);
    return hint;
  }
  return null;
}

export function getRevealedHints() {
  return STORY_HINTS.filter(h => state.revealedHints.has(h.level));
}

export function getEndingType() {
  return isSecretFound() ? 'true' : 'normal';
}

export function getEndingTexts() {
  const type = getEndingType();
  return ENDING_TEXTS[type];
}

export function getEndingIndex() {
  return state.endingIndex;
}

export function advanceEnding() {
  const texts = getEndingTexts();
  state.endingIndex++;
  if (state.endingIndex >= texts.length) return null;
  return texts[state.endingIndex];
}

export function resetEnding() {
  state.endingIndex = 0;
}

export function resetStory() {
  state.revealedHints.clear();
  state.openingIndex = 0;
  state.endingIndex = 0;
  state.openingComplete = false;
}
