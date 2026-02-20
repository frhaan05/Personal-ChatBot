import { speakText } from "./textToSpeech.js";
import { currentHistory, updateProjectInStorage } from "./LeftSidebar.js";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");

function autoScroll() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function autoResizeTextarea(userInput) {
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 200) + "px";
  });
}

function createMsgRow(sender, text, allowSpeaker = true) {
  const row = document.createElement("div");
  row.className = "msg-row " + (sender === "user" ? "user" : "bot");

  // Bot avatar
  if (sender === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "B";
    row.appendChild(avatar);
  }

  // Message bubble
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const contentSpan = document.createElement("span");
  try {
    contentSpan.innerHTML = marked.parse(text);
  } catch {
    contentSpan.textContent = text;
  }
  bubble.appendChild(contentSpan);

  // Speaker button (bot only)
  if (sender === "bot" && allowSpeaker) {
    const speakerBtn = document.createElement("button");
    speakerBtn.innerHTML = `<img src="../SVGs/Play.svg" alt="Play Icon" />`;
    speakerBtn.className = "icon-btn speaker-btn";
    speakerBtn.title = "Play voice";
    speakerBtn.dataset.playing = "false";
    speakerBtn.addEventListener("click", () => speakText(text, speakerBtn));
    bubble.appendChild(speakerBtn);
  }

  row.appendChild(bubble);

  // User avatar
  if (sender === "user") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "F";
    row.appendChild(avatar);
  }

  return row;
}

function addMessage(sender, text, save = true, allowSpeaker = true, projectName = null) {
  const row = createMsgRow(sender, text, allowSpeaker);
  row.querySelector(".bubble").classList.add("fade-in");
  chatBox.appendChild(row);
  autoScroll();

  // Play message sound (if exists)
  const sound = document.getElementById("msg-sound");
  if (sound) sound.play().catch(() => {});

  // Save message if required
  if (save) saveMessage(sender, text, projectName);
}

function saveMessage(sender, text, projectName = null) {
  const message = { role: sender, content: text };

  if (projectName) {
    let projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const project = projects.find((p) => p.name === projectName);
    if (project) {
      const lastChat =
        project.chats[project.chats.length - 1] || {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          name: "Unnamed Chat ...",
          messages: [],
        };
      lastChat.messages.push(message);
      if (!project.chats.includes(lastChat)) project.chats.push(lastChat);
      updateProjectInStorage(projectName, project);
    }
  } else {
    let history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const lastChat =
      history[history.length - 1] || {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        name: "Unnamed Chat ...",
        messages: [],
      };
    lastChat.messages.push(message);
    if (history.length === 0 || history[history.length - 1].id !== lastChat.id) {
      history.push(lastChat);
    }
    localStorage.setItem("chatHistory", JSON.stringify(history));
    currentHistory.length = 0;
    currentHistory.push(...history);
  }
}

function loadChatHistory(chat = null, projectName = null) {
  clearChat();

  if (!chat) {
    addMessage("bot", "No messages to display.", false);
    return;
  }

  if (projectName && chat) {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const project = projects.find((p) => p.name === projectName);
    if (project && project.chats) {
      const targetChat = project.chats.find((c) => c.id === chat.id);
      if (targetChat && targetChat.messages?.length > 0) {
        targetChat.messages.forEach((msg) => {
          addMessage(msg.role, msg.content, false);
        });
      } else {
        addMessage("bot", "No messages to display.", false);
      }
    }
  } else if (chat.messages?.length > 0) {
    chat.messages.forEach((msg) => {
      addMessage(msg.role, msg.content, false);
    });
  } else {
    addMessage("bot", "No messages to display.", false);
  }
}

function clearChat() {
  while (chatBox.firstChild) {
    chatBox.removeChild(chatBox.firstChild);
  }
}

// Handle user input
if (userInput && submitBtn) {
  autoResizeTextarea(userInput);
  submitBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (text) {
      addMessage("user", text, true);
      userInput.value = "";
      userInput.style.height = "auto";
    }
  });

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    }
  });
}

// Typing indicator
function showTyping() {
  const existing = document.querySelector(".typing-indicator");
  if (existing) existing.remove();

  const row = document.createElement("div");
  row.className = "msg-row bot typing-indicator";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "B";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing";
  bubble.innerHTML =
    '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatBox.appendChild(row);
  autoScroll();
}

function hideTyping() {
  const existing = document.querySelector(".typing-indicator");
  if (existing) existing.remove();
}

export {
  autoResizeTextarea,
  addMessage,
  loadChatHistory,
  clearChat,
  showTyping,
  hideTyping,
};
