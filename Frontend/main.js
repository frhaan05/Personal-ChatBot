import { updateProjectInStorage } from "./modules/LeftSidebar.js";
import { initSettings } from "./modules/settings.js";
import { initSpeechRecognition } from "./modules/speechRecognition.js";
import { autoResizeTextarea, loadChatHistory, clearChat, addMessage } from "./modules/chatUI.js";
import { sendMessage } from "./modules/messageHandler.js";
import { initLeftSidebar, currentProject, currentChatId, currentChatType } from "./modules/LeftSidebar.js";

const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const clearBtn = document.getElementById("clear-chat");
const micBtn = document.getElementById("mic-btn");

// ---------- Page Load ----------
window.addEventListener("load", () => {
  autoResizeTextarea(userInput);
  initSettings();
  initSpeechRecognition(micBtn, userInput, sendMessage);
  initLeftSidebar(); // Sets initial chat context and loads chat
});

sendBtn.addEventListener("click", () => sendMessage(currentProject));
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(currentProject);
  }
});

clearBtn.addEventListener("click", () => {
  if (currentChatId && currentChatType) {
    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    if (currentChatType === 'global') {
      const chat = history.find(c => c.id === currentChatId);
      if (chat) {
        chat.messages = [];
        localStorage.setItem("chatHistory", JSON.stringify(history));
      }
    } else if (currentChatType === 'project' && currentProject) {
      const project = projects.find(p => p.name === currentProject);
      if (project) {
        const chat = project.chats.find(c => c.id === currentChatId);
        if (chat) {
          chat.messages = [];
          updateProjectInStorage(currentProject, project);
        }
      }
    }
    clearChat();
    addMessage("bot", "Chat cleared. How can I help you?", true);
  } else {
    clearChat();
    addMessage("bot", "No active chat to clear. Start a new conversation?", true);
  }
});