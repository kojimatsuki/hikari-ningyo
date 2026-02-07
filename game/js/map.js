// map.js — マップ・エリア移動ロジック

import { STAGES } from './data.js';
import { getLevel, getUnfoundDollsInStage, canFindSecret } from './dolls.js';

const state = {
  currentStage: 0,
};

export function getCurrentStage() {
  return STAGES[state.currentStage];
}

export function getCurrentStageIndex() {
  return state.currentStage;
}

export function setStage(index) {
  if (index >= 0 && index < STAGES.length) {
    state.currentStage = index;
  }
}

export function getAvailableStages() {
  const level = getLevel();
  return STAGES.filter(s => s.requiredLevel <= level);
}

export function canAccessStage(stageIndex) {
  if (stageIndex < 0 || stageIndex >= STAGES.length) return false;
  if (stageIndex === 3) return canFindSecret();
  return STAGES[stageIndex].requiredLevel <= getLevel();
}

export function getStageHotspots(stageIndex) {
  const unfound = getUnfoundDollsInStage(stageIndex);
  return unfound.map(doll => ({
    dollId: doll.id,
    x: doll.hotspot.x,
    y: doll.hotspot.y,
    emoji: doll.hiddenEmoji,
    glowing: true,
  }));
}

export function hasNextStage() {
  return state.currentStage < STAGES.length - 1;
}

export function getNextAvailableStage() {
  const level = getLevel();
  for (let i = state.currentStage + 1; i < STAGES.length; i++) {
    if (STAGES[i].requiredLevel <= level) return i;
    if (i === 3 && canFindSecret()) return i;
  }
  return -1;
}

export function resetMap() {
  state.currentStage = 0;
}
