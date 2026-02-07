// dolls.js — 人形コレクション管理

import { DOLLS, LEVEL_THRESHOLDS } from './data.js';

const state = {
  foundDollIds: new Set(),
};

export function findDoll(dollId) {
  state.foundDollIds.add(dollId);
}

export function isDollFound(dollId) {
  return state.foundDollIds.has(dollId);
}

export function getFoundDolls() {
  return DOLLS.filter(d => state.foundDollIds.has(d.id));
}

export function getFoundCount() {
  return state.foundDollIds.size;
}

export function getAllDolls() {
  return DOLLS;
}

export function getDollById(id) {
  return DOLLS.find(d => d.id === id);
}

export function getLevel() {
  const count = state.foundDollIds.size;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getExpProgress() {
  const level = getLevel();
  if (level >= LEVEL_THRESHOLDS.length) return { current: 0, needed: 0, ratio: 1 };
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  const current = state.foundDollIds.size - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current, needed, ratio: current / needed };
}

export function isAllNormalFound() {
  return DOLLS.filter(d => !d.isSecret).every(d => state.foundDollIds.has(d.id));
}

export function isSecretFound() {
  const secret = DOLLS.find(d => d.isSecret);
  return secret ? state.foundDollIds.has(secret.id) : false;
}

export function canFindSecret() {
  return isAllNormalFound();
}

export function getUnfoundDollsInStage(stageId) {
  return DOLLS.filter(d => d.stage === stageId && !state.foundDollIds.has(d.id));
}

export function resetDolls() {
  state.foundDollIds.clear();
}
