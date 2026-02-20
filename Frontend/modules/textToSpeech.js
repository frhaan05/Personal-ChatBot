// modules/textToSpeech.js – Bot speech output (TTS) integrated with settings

import { getMappedVoice, getCurrentSettings } from "./settings.js";

let currentUtterance = null;
let currentPlayingBtn = null;

function _resetBtnToPlay(btn) {
  if (!btn) return;
  btn.dataset.playing = "false";
  btn.innerHTML = `<img src="../SVGs/Play.svg" alt="Play Icon" />`;
}

function _setBtnToStop(btn) {
  if (!btn) return;
  btn.dataset.playing = "true";
  btn.innerHTML = `<img src="../SVGs/stop.svg" alt="Stop Icon" />`;
}

function _toPlainText(text) {
  if (!text) return "";
  try {
    const tmp = document.createElement("div");
    tmp.innerHTML = text;
    return (tmp.textContent || tmp.innerText || text).replace(/\s+/g, " ").trim();
  } catch {
    return String(text);
  }
}

function speakText(text, btn) {
  const settings = getCurrentSettings
    ? getCurrentSettings()
    : { voice: "default", speed: "1" };
  const plain = _toPlainText(text);

  // toggle stop
  if (btn && btn.dataset.playing === "true" && currentPlayingBtn === btn) {
    try { speechSynthesis.cancel(); } catch {}
    _resetBtnToPlay(btn);
    currentUtterance = null;
    currentPlayingBtn = null;
    return;
  }

  try { speechSynthesis.cancel(); } catch {}
  if (currentPlayingBtn && currentPlayingBtn !== btn)
    _resetBtnToPlay(currentPlayingBtn);
  currentUtterance = null;
  currentPlayingBtn = null;

  const utter = new SpeechSynthesisUtterance(plain);
  utter.lang = "en-US";
  const rateBase = Number(settings.speed) || 1;
  utter.rate = rateBase;

  if (settings.voice === "female") {
    const v = getMappedVoice("female");
    if (v) utter.voice = v;
    utter.pitch = 1.15;
  } else if (settings.voice === "male") {
    const v = getMappedVoice("male");
    if (v) utter.voice = v;
    utter.pitch = 3;
  } else if (settings.voice === "robotic") {
    utter.pitch = 0;
    utter.rate = Math.max(0.6, rateBase * 0.85);
    utter.volume = 1.0;
  } else {
    const v = getMappedVoice("default");
    if (v) utter.voice = v;
    utter.pitch = 1.0;
  }

  if (btn) {
    currentPlayingBtn = btn;
    _setBtnToStop(btn);
  }

  currentUtterance = utter;

  utter.onend = () => {
    if (btn) _resetBtnToPlay(btn);
    currentUtterance = null;
    currentPlayingBtn = null;
  };

  utter.onerror = (err) => {
    console.error("TTS error:", err);
    if (btn) _resetBtnToPlay(btn);
    currentUtterance = null;
    currentPlayingBtn = null;
  };

  const voicesNow = speechSynthesis.getVoices();
  if (!voicesNow || voicesNow.length === 0) {
    const onVoicesChanged = () => {
      speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      if (settings.voice !== "robotic") {
        const v2 = getMappedVoice(settings.voice);
        if (v2) utter.voice = v2;
      }
      speechSynthesis.speak(utter);
    };
    speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    window.speechSynthesis.getVoices();
  } else {
    try {
      speechSynthesis.speak(utter);
    } catch (e) {
      console.error("speak failed:", e);
      if (btn) _resetBtnToPlay(btn);
      currentUtterance = null;
      currentPlayingBtn = null;
    }
  }
}

export { speakText };
