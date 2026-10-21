import { createTag } from '../../scripts/utils.js';

const LANA_OPTIONS = {
  tags: 'audio',
  errorType: 'i',
  severity: 'error',
};

export const EVT = {
  PLAYED: 'audio-played',
  PAUSED: 'audio-paused',
  ENDED: 'audio-ended',
  STOPPED: 'audio-stopped',
};

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function on(name, handler) {
  const wrapped = (e) => {
    try { handler(e.detail); } catch (err) {
      window.lana?.log(`Audio handler failed for "${name}": ${err}`, LANA_OPTIONS);
    }
  };
  window.addEventListener(name, wrapped);
  return () => window.removeEventListener(name, wrapped);
}

const SIZE = 40;
const RING_RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const CENTER = SIZE / 2;

const ARIA = {
  PLAY: 'Play audio',
  PAUSE: 'Pause audio',
};

const PLAY_PATH = '<path d="M26.1463 18.2381L16.9468 13.2938C15.6144 12.5777 14 13.5429 14 15.0555V24.944C14 26.4567 15.6144 27.4218 16.9468 26.7057L26.1463 21.7615C27.5505 21.0067 27.5505 18.9928 26.1463 18.2381Z" fill="currentColor"/>';
const PAUSE_PATH = '<rect x="14" y="13" width="4.5" height="14" fill="currentColor"/><rect x="21.5" y="13" width="4.5" height="14" fill="currentColor"/>';

function setIcon(svg, isPlaying) {
  svg.querySelector('.audio-icon').innerHTML = isPlaying ? PAUSE_PATH : PLAY_PATH;
}

// Analytics: keep `daa-ll` aligned with Play vs Pause when audio plays or stops.
function syncDaaLl(btn, playing) {
  const ll = btn.getAttribute('daa-ll');
  if (!ll) return;
  const label = playing ? 'Pause' : 'Play';
  btn.setAttribute('daa-ll', ll.replaceAll(/\b(?:play|pause)\b/gi, label));
}

function syncBtnA11y(btn, label) {
  if (btn.dataset.bladeControlled) return;
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
}

function updateProgress(svg, ratio) {
  svg.querySelector('.audio-progress').setAttribute('stroke-dashoffset', CIRCUMFERENCE * (1 - ratio));
}

function attachAudioListeners(audio, btn, svg) {
  let stopping = false;
  const ctrl = {
    pause() { if (!audio.paused) audio.pause(); },
    stop() {
      const wasPlaying = !audio.paused;
      stopping = true;
      if (wasPlaying) audio.pause();
      audio.currentTime = 0;
      stopping = false;
      if (wasPlaying) emit(EVT.STOPPED, { source: ctrl, type: 'audio', el: audio });
    },
  };

  on(EVT.PLAYED, (payload) => {
    if (!payload || payload.source === ctrl) return;
    ctrl.stop();
  });

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch((err) => window.lana?.log(`Audio play failed: ${err}`, LANA_OPTIONS));
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    emit(EVT.PLAYED, { source: ctrl, type: 'audio', el: audio });
    btn.classList.add('is-playing');
    syncBtnA11y(btn, ARIA.PAUSE);
    syncDaaLl(btn, true);
    setIcon(svg, true);
  });

  audio.addEventListener('pause', () => {
    btn.classList.remove('is-playing');
    syncBtnA11y(btn, ARIA.PLAY);
    syncDaaLl(btn, false);
    setIcon(svg, false);
    if (!stopping && !audio.ended) {
      emit(EVT.PAUSED, { source: ctrl, type: 'audio', el: audio });
    }
  });

  audio.addEventListener('ended', () => {
    emit(EVT.ENDED, { source: ctrl, type: 'audio', el: audio });
    btn.classList.remove('is-playing');
    syncBtnA11y(btn, ARIA.PLAY);
    syncDaaLl(btn, false);
    setIcon(svg, false);
    updateProgress(svg, 0);
  });

  audio.addEventListener('timeupdate', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      updateProgress(svg, audio.currentTime / audio.duration);
    }
  });

  audio.addEventListener('error', () => {
    window.lana?.log(`Audio failed to load: ${audio.currentSrc || audio.src}`, LANA_OPTIONS);
  });

  return ctrl;
}

function buildPlayerSvg() {
  const div = document.createElement('div');
  div.innerHTML = `<svg viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" fill="none" aria-hidden="true">
    <circle class="audio-track" cx="${CENTER}" cy="${CENTER}" r="${RING_RADIUS}" stroke="currentColor" stroke-opacity="0.2" stroke-width="3"/>
    <circle class="audio-progress" cx="${CENTER}" cy="${CENTER}" r="${RING_RADIUS}"
      stroke="currentColor" stroke-width="3" stroke-linecap="round"
      stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${CIRCUMFERENCE}"
      transform="rotate(-90 ${CENTER} ${CENTER})"/>
    <g class="audio-icon">${PLAY_PATH}</g>
  </svg>`;
  return div.firstElementChild;
}

function buildAudioPlayer(src, daaLl) {
  const audio = createTag('audio', { preload: 'metadata', src });
  const svg = buildPlayerSvg();
  const playBtn = createTag('button', {
    class: 'audio-play-btn',
    type: 'button',
    'aria-label': ARIA.PLAY,
    title: ARIA.PLAY,
  });
  if (daaLl) playBtn.setAttribute('daa-ll', daaLl);
  playBtn.appendChild(svg);

  attachAudioListeners(audio, playBtn, svg);

  const wrapper = createTag('div', { class: 'audio-player' });
  wrapper.append(playBtn, audio);
  return wrapper;
}

export default function init(a) {
  try {
    a.replaceWith(buildAudioPlayer(a.href, a.getAttribute('daa-ll')));
  } catch (err) {
    window.lana?.log(`Audio link failed to initialize: ${err}`, LANA_OPTIONS);
  }
}
