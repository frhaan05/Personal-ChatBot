import { addMessage, showTyping, hideTyping } from "./chatUI.js";
import { currentProject, currentChatId, currentChatType } from "./LeftSidebar.js";

const BACKEND_URL = "http://127.0.0.1:8000/chat";
const userInput = document.getElementById("user-input");

async function sendMessage(projectName = null) {
  const text = userInput.value.trim();
  if (!text) return;

  if (!currentChatId || !currentChatType) {
    console.error("Cannot send message: currentChatId or currentChatType not set");
    return;
  }

  addMessage("user", text, true, true, projectName || currentProject);
  userInput.value = "";
  userInput.style.height = "auto";
  showTyping();

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      addMessage("bot", `Error: Backend returned ${res.status}`, true, true, projectName || currentProject);
    } else {
      const data = await res.json();
      if (data.type === "text") {
        addMessage("bot", data.content || "Sorry, no reply.", true, true, projectName || currentProject);
      } else if (data.type === "multimodal") {
        let html = data.content.text ? `<p>${data.content.text}</p>` : "";
        (data.content.images || []).forEach((url) => {
          html += `
            <div class="chat-image-wrapper">
              <img src="${url}" class="generated-image"/>
              <div class="image-actions">
                <button class="action-btn download-btn" data-src="${url}" title="Download Image">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
                <button class="action-btn regenerate-btn" data-src="${url}" data-prompt="${text}" title="Regenerate Image">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4v6h6"></path>
                    <path d="M20 20v-6h-6"></path>
                  </svg>
                </button>
              </div>
            </div>`;
        });
        addMessage("bot", html, true, false, projectName || currentProject);
      }
    }
  } catch {
    addMessage("bot", "Error: Could not reach backend.", true, true, projectName || currentProject);
  } finally {
    hideTyping();
  }
}

// Regenerate button
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".regenerate-btn");
  if (!btn) return;

  const prompt = btn.dataset.prompt;
  const parentWrapper = btn.closest(".chat-image-wrapper");
  const img = parentWrapper.querySelector(".generated-image");

  let overlay = parentWrapper.querySelector(".loading-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `<img src="../SVGs/loading.svg" class="loading-icon" alt="Loading...">`;
    parentWrapper.appendChild(overlay);
  }
  overlay.style.display = "flex";

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "regenerate image", prompt }),
    });
    const data = await res.json();
    if (data.type === "multimodal" && data.content.images.length > 0) {
      const newUrl = data.content.images[0];
      img.src = newUrl;
      btn.dataset.src = newUrl;
      const downloadBtn = btn.closest(".image-actions").querySelector(".download-btn");
      if (downloadBtn) downloadBtn.dataset.src = newUrl;
    } else alert("Failed to Regenerate Image. Free tries may be ended.");
  } catch {
    alert("Failed to Regenerate Image. Free tries may be ended.");
  } finally {
    overlay.style.display = "none";
  }
});

// Download button
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".download-btn");
  if (!btn) return;
  const src = btn.dataset.src;
  const a = document.createElement("a");
  a.href = src;
  a.download = `generated-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
});

export { sendMessage };