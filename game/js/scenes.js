// scenes.js — シーン管理（タイトル/オープニング/探索/イベント/エンディング）

import { OPENING_TEXTS } from './data.js';
import {
  findDoll, getDollById, getLevel, getFoundCount,
  isAllNormalFound, isSecretFound, canFindSecret,
} from './dolls.js';
import {
  getOpeningIndex, advanceOpening, isOpeningComplete,
  checkNewHint, getEndingTexts, getEndingIndex, advanceEnding, resetEnding,
} from './story.js';
import { getCurrentStageIndex, setStage, canAccessStage } from './map.js';
import {
  showScreen, showDialog, showDiscovery, showLevelUp,
  showStoryReveal, showEncyclopedia, showSecretEffect,
  renderExploration, updateHUD, hideHUD,
} from './ui.js';
import {
  resumeAudio, playBGM, stopBGM, playDiscovery as playDiscoverySound,
  playClick, playMemory, playFanfare, playLevelUp as playLevelUpSound,
  playEndingMusic,
} from './audio.js';

let currentScene = 'title';

export function startTitle() {
  currentScene = 'title';
  hideHUD();
  showScreen('title-screen');
  stopBGM();
}

export function startOpening() {
  currentScene = 'opening';
  resumeAudio();
  showScreen('opening-screen');
  showOpeningText();
}

function showOpeningText() {
  const index = getOpeningIndex();
  const entry = OPENING_TEXTS[index];
  if (!entry) {
    startExploration();
    return;
  }

  const emojiEl = document.getElementById('opening-emoji');
  const textEl = document.getElementById('opening-text');
  const container = document.getElementById('opening-content');

  emojiEl.textContent = entry.emoji;
  textEl.textContent = '';
  container.classList.add('fade-in');

  // テキストアニメーション
  let i = 0;
  const chars = entry.text.split('');
  function typeChar() {
    if (i < chars.length) {
      textEl.textContent += chars[i];
      i++;
      setTimeout(typeChar, 50);
    }
  }
  typeChar();

  const btn = document.getElementById('opening-next');
  const handler = () => {
    if (i < chars.length) {
      textEl.textContent = entry.text;
      i = chars.length;
      return;
    }
    btn.removeEventListener('click', handler);
    container.classList.remove('fade-in');
    advanceOpening();
    if (isOpeningComplete()) {
      startExploration();
    } else {
      showOpeningText();
    }
  };
  btn.removeEventListener('click', handler);
  btn.addEventListener('click', handler);
}

export function startExploration() {
  currentScene = 'exploration';
  showScreen('exploration-screen');
  playBGM(getCurrentStageIndex());
  renderExploration(handleHotspotClick, handleStageSelect);
}

function handleHotspotClick(dollId) {
  playClick();
  const doll = getDollById(dollId);
  if (!doll) return;

  const prevLevel = getLevel();

  // シークレット人形の特別演出
  if (doll.isSecret) {
    playFanfare();
    showSecretEffect();
  } else {
    playDiscoverySound();
  }

  findDoll(dollId);
  const newLevel = getLevel();

  showDiscovery(doll, () => {
    if (newLevel > prevLevel) {
      playLevelUpSound();
      showLevelUp(newLevel, () => {
        const hint = checkNewHint();
        if (hint) {
          playMemory();
          showStoryReveal(hint, () => checkGameEnd());
        } else {
          checkGameEnd();
        }
      });
    } else {
      checkGameEnd();
    }
  });
}

function checkGameEnd() {
  // シークレット発見 → 真エンディング
  if (isSecretFound()) {
    startEnding();
    return;
  }
  // 全通常人形発見で最終ステージ解放
  if (isAllNormalFound() && getCurrentStageIndex() < 3) {
    showDialog(
      'すべての仲間を見つけた！\n…あれ？まだどこかに誰かいるみたい…',
      '✨',
      () => {
        setStage(3);
        startExploration();
      }
    );
    return;
  }
  // 通常の探索に戻る
  startExploration();
}

function handleStageSelect(stageId) {
  if (!canAccessStage(stageId)) {
    playClick();
    showDialog('まだ この場所には 行けないみたい…\nもっと 仲間を見つけよう！', '🔒', null);
    return;
  }
  playClick();
  setStage(stageId);
  playBGM(stageId);
  renderExploration(handleHotspotClick, handleStageSelect);
}

export function openEncyclopedia() {
  playClick();
  showEncyclopedia(() => {
    if (currentScene === 'exploration') {
      renderExploration(handleHotspotClick, handleStageSelect);
    }
  });
}

function startEnding() {
  currentScene = 'ending';
  stopBGM();
  playEndingMusic();
  resetEnding();
  showScreen('ending-screen');
  showEndingText();
}

function showEndingText() {
  const texts = getEndingTexts();
  const index = getEndingIndex();
  const entry = texts[index];
  if (!entry) return;

  const emojiEl = document.getElementById('ending-emoji');
  const textEl = document.getElementById('ending-text');

  emojiEl.textContent = entry.emoji;
  textEl.textContent = '';

  let i = 0;
  const chars = entry.text.split('');
  function typeChar() {
    if (i < chars.length) {
      textEl.textContent += chars[i];
      i++;
      setTimeout(typeChar, 50);
    }
  }
  typeChar();

  const btn = document.getElementById('ending-next');
  const handler = () => {
    if (i < chars.length) {
      textEl.textContent = entry.text;
      i = chars.length;
      return;
    }
    btn.removeEventListener('click', handler);
    const next = advanceEnding();
    if (next) {
      showEndingText();
    } else {
      showEndingComplete();
    }
  };
  btn.removeEventListener('click', handler);
  btn.addEventListener('click', handler);
}

function showEndingComplete() {
  document.getElementById('ending-next').style.display = 'none';
  document.getElementById('ending-restart').style.display = 'block';
}

export function getCurrentScene() {
  return currentScene;
}
