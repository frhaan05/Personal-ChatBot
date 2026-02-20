function humanizeVoiceKey(key) {
  if (!key) return "Default";
  const map = {
    default: "Default",
    male: "Male",
    female: "Female",
    robotic: "Robotic"
  };
  return map[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

function getMappedVoice(selectedKey) {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  selectedKey = (selectedKey || "default").toLowerCase();

  switch (selectedKey) {
    case "male":
      return voices.find(v => /male|david|george|fred|alex|paul/i.test(v.name)) || voices[0];
    case "female":
      return voices.find(v => /female|zira|susan|victoria|anna|samantha|karen/i.test(v.name)) || voices[0];
    case "robotic":
      return null;
    default:
      return voices.find(v => v.default) || voices[0];
  }
}

let savedSettings = { voice: "default", speed: "1" };
let tempSettings = { ...savedSettings };

function setupSettings() {
  const sidebar = document.getElementById('settings-sidebar');
  const openBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-settings');
  const customSelect = document.getElementById('voice-select');
  const testBtn = document.getElementById('test-voice-btn');
  const saveBtn = document.getElementById('save-settings') || document.getElementById('save-settings-btn') || document.querySelector('.save-btn');
  const trigger = customSelect?.querySelector('.select-trigger');
  const options = customSelect?.querySelectorAll('.option');
  const speedSlider = document.querySelector('.speed-range');

  if (!sidebar || !openBtn || !closeBtn || !customSelect || !testBtn || !saveBtn) {
    console.warn('settings: missing core elements');
    return;
  }

  // Load saved settings
  try {
    const savedRaw = localStorage.getItem('voiceSettings');
    if (savedRaw) {
      savedSettings = JSON.parse(savedRaw);
      tempSettings = { ...savedSettings };
    }
  } catch (err) {
    console.warn('settings: failed to parse saved settings', err);
  }

  // Apply settings to UI
  function applyToUI(settings) {
    if (trigger) trigger.textContent = humanizeVoiceKey(settings.voice);
    if (speedSlider) speedSlider.value = settings.speed;
  }
  applyToUI(savedSettings);

  // Open sidebar
  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tempSettings = { ...savedSettings };
    applyToUI(tempSettings);
    sidebar.classList.add('open');
  });

  // Close sidebar (discard changes)
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyToUI(savedSettings);
    sidebar.classList.remove('open');
  });

  // Dropdown logic
  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    customSelect.classList.toggle('open');
  });

  options?.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const value = option.dataset.value;
      tempSettings.voice = value || "default";
      if (trigger) trigger.textContent = option.textContent || humanizeVoiceKey(tempSettings.voice);
      customSelect.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove('open');
    }
  });

  // Speed slider
  speedSlider?.addEventListener('input', (e) => {
    e.stopPropagation();
    tempSettings.speed = String(speedSlider.value);
  });

  // Test Voice Button
  testBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const sample = "Hello! This is a test of the selected voice.";
    const utterance = new SpeechSynthesisUtterance(sample);

    utterance.rate = Number(tempSettings.speed) || 1;

    if (tempSettings.voice === "robotic") {
      utterance.pitch = 0.3;
      utterance.rate = Math.max(0.6, (Number(tempSettings.speed) || 1) * 0.85);
      utterance.volume = 1.0;
    } else {
      const chosenVoice = getMappedVoice(tempSettings.voice);
      if (chosenVoice) utterance.voice = chosenVoice;
    }

    const voicesNow = window.speechSynthesis.getVoices();
    if (!voicesNow || voicesNow.length === 0) {
      const onVoicesChanged = () => {
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      window.speechSynthesis.getVoices();
    } else {
      window.speechSynthesis.speak(utterance);
    }
  });

  // Save Button
  saveBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    savedSettings = { ...tempSettings };
    try {
      localStorage.setItem('voiceSettings', JSON.stringify(savedSettings));
      console.log('Saved voice settings:', savedSettings);
    } catch (err) {
      console.error('Failed to save voice settings', err);
    }

    if (!saveBtn.dataset.originalText) {
      saveBtn.dataset.originalText = saveBtn.textContent;
    }
    saveBtn.textContent = 'Saved ✓';
    saveBtn.classList.add('saved');

    sidebar.classList.remove('open');

    setTimeout(() => {
      saveBtn.textContent = saveBtn.dataset.originalText;
      saveBtn.classList.remove('saved');
    }, 1200);
  });
}

function getCurrentSettings() {
  try {
    if (savedSettings) return { ...savedSettings };
    const savedRaw = localStorage.getItem('voiceSettings');
    if (savedRaw) return JSON.parse(savedRaw);
  } catch (e) {}
  return { voice: "default", speed: "1" };
}

export { setupSettings as initSettings, getMappedVoice, getCurrentSettings };