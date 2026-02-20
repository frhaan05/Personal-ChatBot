// speechRecognition.js – Handles microphone input and speech-to-text

let recognition, autoStopTimer;

function initSpeechRecognition(micBtn, userInput, sendMessage) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  micBtn.addEventListener("click", () => {
    if (micBtn.dataset.listening === "true") {
      recognition.stop();
      micBtn.dataset.listening = "false";
      setSVGColor(micBtn, "currentColor");
      clearTimeout(autoStopTimer);
    } else {
      recognition.start();
      micBtn.dataset.listening = "true";
      setSVGColor(micBtn, "red");
      autoStopTimer = setTimeout(() => recognition.stop(), 8000);
    }
  });

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    userInput.value = transcript.trim();
  };

  recognition.onend = () => {
    micBtn.dataset.listening = "false";
    setSVGColor(micBtn, "currentColor");
    clearTimeout(autoStopTimer);
    if (userInput.value.trim() !== "") sendMessage();
  };
}

function setSVGColor(micBtn, color) {
  const svgPaths = micBtn.querySelectorAll("svg path, svg line");
  svgPaths.forEach((p) => p.setAttribute("stroke", color));
}

export { initSpeechRecognition };
