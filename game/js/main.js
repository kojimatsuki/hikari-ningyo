// main.js — ゲーム初期化・メインループ

import { initAudio, resumeAudio } from './audio.js';
import { resetDolls } from './dolls.js';
import { resetStory } from './story.js';
import { resetMap } from './map.js';
import { startTitle, startOpening, openEncyclopedia } from './scenes.js';

function init() {
  // タイトル画面のボタン
  document.getElementById('start-btn').addEventListener('click', () => {
    resumeAudio();
    startOpening();
  });

  // 図鑑ボタン
  document.getElementById('encyclopedia-btn').addEventListener('click', () => {
    openEncyclopedia();
  });

  // リスタートボタン
  document.getElementById('ending-restart').addEventListener('click', () => {
    resetDolls();
    resetStory();
    resetMap();
    document.getElementById('ending-next').style.display = 'block';
    document.getElementById('ending-restart').style.display = 'none';
    startTitle();
  });

  // 通常エンディングへのボタン（メニュー内）
  document.getElementById('end-game-btn').addEventListener('click', () => {
    resumeAudio();
    // 探索画面から通常エンディングに移行
    import('./scenes.js').then(mod => {
      // 通常エンディングを直接呼ぶためにシーンを切り替え
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('ending-screen').classList.add('active');
      // エンディングテキスト表示
      import('./story.js').then(story => {
        story.resetEnding();
        const texts = story.getEndingTexts();
        const entry = texts[0];
        document.getElementById('ending-emoji').textContent = entry.emoji;
        document.getElementById('ending-text').textContent = entry.text;
        import('./audio.js').then(audio => {
          audio.stopBGM();
          audio.playEndingMusic();
        });
        // 次のテキストへのハンドラを設定
        setupEndingNav(story, texts);
      });
    });
  });

  initAudio();
  startTitle();

  // タイトル画面のアニメーション
  animateTitle();
}

function setupEndingNav(story, texts) {
  const btn = document.getElementById('ending-next');
  btn.style.display = 'block';
  document.getElementById('ending-restart').style.display = 'none';

  function handler() {
    const next = story.advanceEnding();
    if (next) {
      document.getElementById('ending-emoji').textContent = next.emoji;
      document.getElementById('ending-text').textContent = next.text;
    } else {
      btn.removeEventListener('click', handler);
      btn.style.display = 'none';
      document.getElementById('ending-restart').style.display = 'block';
    }
  }
  btn.addEventListener('click', handler);
}

function animateTitle() {
  const stars = document.getElementById('title-stars');
  if (!stars) return;
  stars.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'title-star';
    star.textContent = Math.random() > 0.5 ? '⭐' : '✨';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 60}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.fontSize = `${0.5 + Math.random() * 1.0}em`;
    stars.appendChild(star);
  }
}

// DOM読み込み後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
