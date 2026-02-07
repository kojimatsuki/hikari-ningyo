// ui.js — UI描画・人形図鑑・メッセージ表示

import { getAllDolls, getFoundDolls, isDollFound, getLevel, getExpProgress } from './dolls.js';
import { getRevealedHints } from './story.js';
import { getCurrentStage, getCurrentStageIndex, getAvailableStages, getStageHotspots } from './map.js';

const $ = id => document.getElementById(id);

export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = $(screenId);
  if (screen) screen.classList.add('active');
}

// --- HUD ---
export function updateHUD() {
  const hud = $('hud');
  if (!hud) return;
  hud.style.display = 'flex';
  const level = getLevel();
  const exp = getExpProgress();
  $('hud-level').textContent = `Lv.${level}`;
  const bar = $('exp-bar-fill');
  if (bar) bar.style.width = `${exp.ratio * 100}%`;
  renderCompanions();
}

export function hideHUD() {
  const hud = $('hud');
  if (hud) hud.style.display = 'none';
}

function renderCompanions() {
  const container = $('companions');
  if (!container) return;
  container.innerHTML = '';
  const found = getFoundDolls();
  found.forEach(doll => {
    const span = document.createElement('span');
    span.className = 'companion-icon';
    span.textContent = doll.emoji;
    span.title = doll.name;
    container.appendChild(span);
  });
}

// --- 探索画面 ---
export function renderExploration(onHotspotClick, onStageSelect) {
  const stage = getCurrentStage();
  const stageIndex = getCurrentStageIndex();
  const scene = $('exploration-scene');
  if (!scene) return;

  // 背景グラデーション
  const colors = stage.bgGradient;
  scene.style.background = `linear-gradient(to bottom, ${colors.join(', ')})`;

  // ステージ名
  $('stage-name').textContent = `${stage.name} — ${stage.subtitle}`;
  $('stage-description').textContent = stage.description;

  // デコレーション
  const decoContainer = $('decorations');
  decoContainer.innerHTML = '';
  stage.decorations.forEach(deco => {
    const el = document.createElement('div');
    el.className = 'decoration';
    el.textContent = deco.emoji;
    el.style.left = `${deco.x}%`;
    el.style.top = `${deco.y}%`;
    el.style.fontSize = `${deco.size}em`;
    decoContainer.appendChild(el);
  });

  // プレイヤー
  const player = $('player');
  if (player) player.textContent = '🧸';

  // ホットスポット（迷子の人形）
  const hotspotContainer = $('hotspots');
  hotspotContainer.innerHTML = '';
  const hotspots = getStageHotspots(stageIndex);
  hotspots.forEach(hs => {
    const el = document.createElement('div');
    el.className = 'hotspot glowing';
    el.textContent = '❓';
    el.style.left = `${hs.x}%`;
    el.style.top = `${hs.y}%`;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onHotspotClick(hs.dollId);
    });
    hotspotContainer.appendChild(el);
  });

  // ステージ移動ボタン
  renderStageNav(onStageSelect);
  updateHUD();
}

function renderStageNav(onStageSelect) {
  const nav = $('stage-nav');
  if (!nav) return;
  nav.innerHTML = '';
  const available = getAvailableStages();
  const current = getCurrentStageIndex();
  available.forEach(stage => {
    const btn = document.createElement('button');
    btn.className = 'stage-nav-btn' + (stage.id === current ? ' active' : '');
    btn.textContent = stage.bgEmojis[0] + ' ' + stage.name;
    btn.addEventListener('click', () => onStageSelect(stage.id));
    nav.appendChild(btn);
  });
}

// --- ダイアログ ---
export function showDialog(text, emoji, onClose) {
  const overlay = $('dialog-overlay');
  const dialogEmoji = $('dialog-emoji');
  const dialogText = $('dialog-text');
  const dialogBtn = $('dialog-btn');

  overlay.classList.add('active');
  dialogEmoji.textContent = emoji || '';
  dialogText.textContent = '';

  // テキストアニメーション
  let i = 0;
  const chars = text.split('');
  function typeChar() {
    if (i < chars.length) {
      dialogText.textContent += chars[i];
      i++;
      setTimeout(typeChar, 40);
    }
  }
  typeChar();

  const handler = () => {
    if (i < chars.length) {
      dialogText.textContent = text;
      i = chars.length;
      return;
    }
    dialogBtn.removeEventListener('click', handler);
    overlay.classList.remove('active');
    if (onClose) onClose();
  };
  dialogBtn.removeEventListener('click', handler);
  dialogBtn.addEventListener('click', handler);
}

// --- 人形発見演出 ---
export function showDiscovery(doll, onClose) {
  const screen = $('discovery-screen');
  screen.classList.add('active');
  $('discovery-emoji').textContent = doll.emoji;
  $('discovery-name').textContent = doll.name;
  $('discovery-title').textContent = doll.title;
  $('discovery-text').textContent = doll.findText;

  // キラキラエフェクト
  createSparkles($('discovery-effect'));

  const joinBtn = $('discovery-join-btn');
  const handler = () => {
    joinBtn.removeEventListener('click', handler);
    $('discovery-text').textContent = doll.joinText;
    $('discovery-join-btn').textContent = 'もどる';
    const closeHandler = () => {
      joinBtn.removeEventListener('click', closeHandler);
      screen.classList.remove('active');
      joinBtn.textContent = 'なかまにする！';
      $('discovery-effect').innerHTML = '';
      if (onClose) onClose();
    };
    joinBtn.addEventListener('click', closeHandler);
  };
  joinBtn.addEventListener('click', handler);
}

// --- レベルアップ演出 ---
export function showLevelUp(newLevel, onClose) {
  const screen = $('levelup-screen');
  screen.classList.add('active');
  $('levelup-level').textContent = `Lv.${newLevel}`;
  createSparkles($('levelup-effect'));

  setTimeout(() => {
    const btn = $('levelup-btn');
    const handler = () => {
      btn.removeEventListener('click', handler);
      screen.classList.remove('active');
      $('levelup-effect').innerHTML = '';
      if (onClose) onClose();
    };
    btn.addEventListener('click', handler);
  }, 500);
}

// --- ストーリー解放演出 ---
export function showStoryReveal(hint, onClose) {
  const screen = $('story-screen');
  screen.classList.add('active');
  $('story-title').textContent = hint.title;
  $('story-reveal-text').textContent = hint.text;

  const btn = $('story-btn');
  const handler = () => {
    btn.removeEventListener('click', handler);
    screen.classList.remove('active');
    if (onClose) onClose();
  };
  btn.addEventListener('click', handler);
}

// --- 人形図鑑 ---
export function showEncyclopedia(onClose) {
  const screen = $('encyclopedia-screen');
  screen.classList.add('active');
  const list = $('encyclopedia-list');
  list.innerHTML = '';

  const allDolls = getAllDolls();
  allDolls.forEach(doll => {
    const card = document.createElement('div');
    card.className = 'encyclopedia-card' + (isDollFound(doll.id) ? ' found' : '');
    if (isDollFound(doll.id)) {
      card.innerHTML = `
        <div class="card-emoji">${doll.emoji}</div>
        <div class="card-name">${doll.name}</div>
        <div class="card-title">${doll.title}</div>
        <div class="card-desc">${doll.description}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="card-emoji">❓</div>
        <div class="card-name">？？？</div>
        <div class="card-title">${doll.isSecret ? 'シークレット' : 'まだ見つかっていない'}</div>
      `;
    }
    list.appendChild(card);
  });

  // ストーリーメモ
  const hints = getRevealedHints();
  const storySection = $('encyclopedia-story');
  storySection.innerHTML = '<h3>📖 やくそくの記憶</h3>';
  if (hints.length === 0) {
    storySection.innerHTML += '<p class="story-note">まだ何も思い出せない…</p>';
  } else {
    hints.forEach(h => {
      storySection.innerHTML += `<div class="story-note"><strong>${h.title}</strong><p>${h.text}</p></div>`;
    });
  }

  const btn = $('encyclopedia-close');
  const handler = () => {
    btn.removeEventListener('click', handler);
    screen.classList.remove('active');
    if (onClose) onClose();
  };
  btn.addEventListener('click', handler);
}

// --- シークレット演出 ---
export function showSecretEffect() {
  const flash = document.createElement('div');
  flash.className = 'secret-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 2000);
}

// --- キラキラエフェクト ---
function createSparkles(container) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 1}s`;
    sparkle.style.fontSize = `${0.8 + Math.random() * 1.2}em`;
    container.appendChild(sparkle);
  }
}
