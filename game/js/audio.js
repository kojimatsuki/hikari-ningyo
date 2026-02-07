// audio.js — Web Audio API サウンド管理

let ctx = null;
let bgmInterval = null;
let bgmGain = null;
let masterGain = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function playNote(freq, duration, type = 'sine', gainVal = 0.15, delay = 0) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainVal, c.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration);
}

// オルゴール風メロディのノート
const BGM_MELODIES = [
  // ステージ0: 寂しいオルゴール
  [523, 587, 659, 523, 494, 440, 494, 523, 440, 392, 440, 494],
  // ステージ1: 少し明るくなる
  [659, 698, 784, 659, 587, 659, 698, 784, 880, 784, 698, 659],
  // ステージ2: 切ないけど温かい
  [440, 523, 587, 659, 587, 523, 494, 523, 587, 659, 784, 659],
  // ステージ3: 希望のメロディ
  [784, 880, 988, 784, 880, 988, 1047, 988, 880, 784, 880, 988],
];

export function initAudio() {
  getCtx();
}

export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function playBGM(stageIndex = 0) {
  stopBGM();
  const c = getCtx();
  bgmGain = c.createGain();
  bgmGain.gain.value = 0.08;
  bgmGain.connect(masterGain);

  const melody = BGM_MELODIES[stageIndex] || BGM_MELODIES[0];
  let noteIndex = 0;

  function playNextNote() {
    if (!bgmGain) return;
    const freq = melody[noteIndex % melody.length];
    const osc = c.createOscillator();
    const noteGain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    noteGain.gain.setValueAtTime(0.1, c.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8);
    osc.connect(noteGain);
    noteGain.connect(bgmGain);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.9);
    noteIndex++;
  }

  playNextNote();
  bgmInterval = setInterval(playNextNote, 900);
}

export function stopBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  bgmGain = null;
}

export function playDiscovery() {
  // 温かいチャイム音
  const notes = [784, 988, 1175, 1568];
  notes.forEach((freq, i) => {
    playNote(freq, 0.6, 'sine', 0.12, i * 0.15);
  });
}

export function playFootstep() {
  playNote(200, 0.08, 'triangle', 0.05);
}

export function playClick() {
  playNote(600, 0.1, 'sine', 0.08);
}

export function playMemory() {
  // 切ないピアノ風
  const notes = [440, 523, 659, 523, 440, 392, 440];
  notes.forEach((freq, i) => {
    playNote(freq, 1.0, 'triangle', 0.1, i * 0.5);
  });
}

export function playFanfare() {
  // 壮大なファンファーレ
  const notes = [
    [523, 0], [659, 0.2], [784, 0.4], [1047, 0.6],
    [988, 1.0], [1047, 1.3], [1319, 1.5], [1568, 1.8],
  ];
  notes.forEach(([freq, delay]) => {
    playNote(freq, 0.8, 'square', 0.08, delay);
    playNote(freq * 0.5, 0.8, 'sine', 0.06, delay);
  });
}

export function playLevelUp() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playNote(freq, 0.4, 'sine', 0.1, i * 0.12);
    playNote(freq * 1.5, 0.4, 'triangle', 0.05, i * 0.12);
  });
}

export function playEndingMusic() {
  // 優しいオルゴール
  const notes = [659, 784, 880, 784, 659, 587, 523, 587, 659, 784, 880, 1047];
  notes.forEach((freq, i) => {
    playNote(freq, 1.2, 'sine', 0.08, i * 0.6);
  });
}
