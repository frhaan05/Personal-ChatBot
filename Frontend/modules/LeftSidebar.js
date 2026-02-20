import { loadChatHistory, clearChat, addMessage } from "./chatUI.js";

export let currentHistory = [];
export let currentProject = null; // Track current project name
export let currentChatId = null; // Track current chat ID
export let currentChatType = 'global'; // 'global' or 'project'

export function initLeftSidebar() {
  const sidebar = document.getElementById('nav-sidebar');
  const closeBtn = document.getElementById('close-nav');
  const expandBtn = document.getElementById('expand-nav');
  const searchBtn = document.getElementById('chat-btn');
  const projectBtn = document.getElementById('project-btn');

  if (!sidebar || !closeBtn || !expandBtn || !searchBtn || !projectBtn) {
    console.warn('Left sidebar: missing core elements');
    return;
  }

  // Expand sidebar
  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.add('open');
  });

  // Collapse sidebar
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.remove('open');
  });

  // Content Initialization
  initLeftSidebarContent();
}

function initLeftSidebarContent() {
  currentHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  renderRecentHistory();
  renderProjectList();

  // Set initial chat context
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  const projects = JSON.parse(localStorage.getItem("projects") || "[]");
  const allChats = [
    ...history.map(chat => ({ ...chat, project: null })),
    ...projects.flatMap(project => project.chats.map(chat => ({ ...chat, project: project.name })))
  ];
  const recentChat = allChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  if (recentChat) {
    currentChatId = recentChat.id;
    currentChatType = recentChat.project ? 'project' : 'global';
    currentProject = recentChat.project;
    console.log(`Initialized with chat ID: ${currentChatId}, type: ${currentChatType}, project: ${currentProject}`);
    loadChatHistory(recentChat, recentChat.project);
  } else {
    // Create initial global chat
    const newId = Date.now();
    const newChat = {
      id: newId,
      timestamp: new Date().toLocaleString(),
      name: 'New Chat',
      messages: []
    };
    currentHistory.push(newChat);
    localStorage.setItem('chatHistory', JSON.stringify(currentHistory));
    currentChatId = newId;
    currentChatType = 'global';
    currentProject = null;
    console.log(`Created initial global chat ID: ${newId}`);
    addMessage("bot", "Hello! I'm your assistant. Ask me anything.", true);
  }

  // New Chat Button
  const newChatBtn = document.getElementById('new-chat-btn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      // Sync current chat messages to storage
      syncCurrentChatMessages();

      // Create new global chat
      clearChat();
      const newId = Date.now();
      const newChat = {
        id: newId,
        timestamp: new Date().toLocaleString(),
        name: 'New Chat',
        messages: []
      };
      currentHistory.push(newChat);
      localStorage.setItem('chatHistory', JSON.stringify(currentHistory));
      currentChatId = newId;
      currentChatType = 'global';
      currentProject = null;
      console.log(`Created new global chat ID: ${newId}`);

      addMessage("bot", "New chat started! How can I help you today?", true);
      renderRecentHistory();
      document.getElementById('nav-sidebar').classList.remove('open');
    });
  }

  // Search Button
  const searchBtn = document.getElementById('chat-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      openSearchModal();
    });
  }

  // Project Button
  const projectBtn = document.getElementById('project-btn');
  if (projectBtn) {
    projectBtn.addEventListener('click', () => {
      openProjectModal();
    });
  }
}

function syncCurrentChatMessages() {
  if (!currentChatId || !currentChatType) return;

  const chatBox = document.querySelector('.chat-box');
  const messages = Array.from(chatBox.querySelectorAll('.msg-row')).map(row => ({
    role: row.classList.contains('bot') ? 'bot' : 'user',
    content: row.querySelector('.bubble').textContent.trim()
  }));

  if (messages.length > 0) {
    if (currentChatType === 'global') {
      let history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      let chat = history.find(c => c.id === currentChatId);
      if (chat) {
        chat.messages = messages;
        if (chat.name === 'New Chat') {
          const firstUserMsg = messages.find(msg => msg.role === 'user')?.content || '';
          chat.name = firstUserMsg ? firstUserMsg.split(' ').slice(0, 4).join(' ') + ' ...' : 'Unnamed Chat ...';
        }
        localStorage.setItem('chatHistory', JSON.stringify(history));
        currentHistory.length = 0;
        currentHistory.push(...history);
        console.log(`Synced messages for global chat ID: ${currentChatId}`);
      }
    } else if (currentChatType === 'project' && currentProject) {
      let projects = JSON.parse(localStorage.getItem('projects') || '[]');
      let project = projects.find(p => p.name === currentProject);
      if (project) {
        let chat = project.chats.find(c => c.id === currentChatId);
        if (chat) {
          chat.messages = messages;
          if (chat.name === 'New Chat') {
            const firstUserMsg = messages.find(msg => msg.role === 'user')?.content || '';
            chat.name = firstUserMsg ? firstUserMsg.split(' ').slice(0, 4).join(' ') + ' ...' : 'Unnamed Chat ...';
          }
          updateProjectInStorage(currentProject, project);
          console.log(`Synced messages for project ${currentProject} chat ID: ${currentChatId}`);
        }
      }
    }
  }
}

export function renderRecentHistory() {
  const list = document.getElementById('recent-history-list');
  if (!list) {
    console.warn('Recent history list element not found');
    return;
  }

  list.innerHTML = '';
  const allChats = [];
  const standaloneChats = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  allChats.push(...standaloneChats.map(chat => ({ ...chat, project: null })));
  const projects = JSON.parse(localStorage.getItem("projects") || "[]");
  projects.forEach(project => {
    project.chats.forEach(chat => {
      allChats.push({ ...chat, project: project.name });
    });
  });

  const recent = allChats
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  recent.forEach(chat => {
    const item = document.createElement('li');
    item.classList.add('history-item');
    const displayName = chat.project ? `[${chat.project}] ${chat.name}` : chat.name || 'Unnamed Chat ...';
    item.innerHTML = `<p>${displayName}</p>`;
    item.addEventListener('click', () => {
      syncCurrentChatMessages();
      loadChat(chat.id, chat.project);
      document.getElementById('nav-sidebar').classList.remove('open');
    });
    list.appendChild(item);
  });
}

function openSearchModal() {
  const overlay = createModal('Search Chats', `
    <div class="search-modal-input-container">
      <input type="text" id="search-modal-input" class="search-modal-input" placeholder="Search chats...">
      <button id="search-modal-clear" class="search-modal-clear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="search-modal-results" class="search-modal-results"></div>
    <div class="search-modal-delete-all">
      <button id="search-modal-delete-all-btn" class="search-modal-delete-all-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Delete All Chats
      </button>
    </div>
  `, 'search-modal');

  const input = document.getElementById('search-modal-input');
  const clearBtn = document.getElementById('search-modal-clear');
  const results = document.getElementById('search-modal-results');
  const deleteAllBtn = document.getElementById('search-modal-delete-all-btn');

  renderSearchResults('', results);

  input.addEventListener('input', (e) => {
    renderSearchResults(e.target.value, results);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    renderSearchResults('', results);
    input.focus();
  });

  deleteAllBtn.addEventListener('click', () => {
    syncCurrentChatMessages();
    currentHistory = [];
    localStorage.setItem('chatHistory', JSON.stringify(currentHistory));
    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects = projects.map(project => ({ ...project, chats: [] }));
    localStorage.setItem('projects', JSON.stringify(projects));
    renderSearchResults('', results);
    renderRecentHistory();
    clearChat();
    currentChatId = null;
    currentChatType = 'global';
    currentProject = null;
    addMessage("bot", "All chats deleted. Start a new conversation?", true);
  });
}

function renderSearchResults(searchTerm, container) {
  const allChats = [];
  const standaloneChats = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  allChats.push(...standaloneChats.map(chat => ({ ...chat, project: null })));
  const projects = JSON.parse(localStorage.getItem("projects") || "[]");
  projects.forEach(project => {
    project.chats.forEach(chat => {
      allChats.push({ ...chat, project: project.name });
    });
  });

  const filteredHistory = searchTerm
    ? allChats.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : allChats;

  container.innerHTML = filteredHistory.map(chat => `
    <div class="history-item" data-chat-id="${chat.id}" data-project="${chat.project || ''}">
      <p>${chat.project ? `[${chat.project}] ${chat.name}` : chat.name || 'Unnamed Chat ...'}</p>
      <button class="delete-chat-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.history-item').forEach(item => {
    const chatId = parseInt(item.getAttribute('data-chat-id'));
    const projectName = item.getAttribute('data-project') || null;
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-chat-btn')) {
        syncCurrentChatMessages();
        loadChat(chatId, projectName);
        document.getElementById('search-modal').style.display = 'none';
      }
    });
    const deleteBtn = item.querySelector('.delete-chat-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (projectName) {
          let projects = JSON.parse(localStorage.getItem('projects') || '[]');
          const project = projects.find(p => p.name === projectName);
          if (project) {
            project.chats = project.chats.filter(c => c.id !== chatId);
            updateProjectInStorage(projectName, project);
          }
        } else {
          currentHistory = currentHistory.filter(c => c.id !== chatId);
          localStorage.setItem('chatHistory', JSON.stringify(currentHistory));
        }
        renderSearchResults(searchTerm, container);
        renderRecentHistory();
        if (currentChatId === chatId) {
          currentChatId = null;
          currentChatType = 'global';
          currentProject = null;
          clearChat();
        }
      });
    }
  });
}

function loadChat(chatId, projectName = null) {
  syncCurrentChatMessages();
  currentProject = projectName;
  currentChatId = chatId;
  currentChatType = projectName ? 'project' : 'global';
  console.log(`Loading chat ID: ${chatId}, type: ${currentChatType}, project: ${projectName}`);

  let chat;
  if (projectName) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.name === projectName);
    chat = project?.chats.find(c => c.id === chatId);
  } else {
    chat = currentHistory.find(c => c.id === chatId);
  }

  if (chat) {
    loadChatHistory(chat, projectName);
  } else {
    console.warn(`Chat with ID ${chatId} not found`);
    clearChat();
    addMessage("bot", "Chat not found. Start a new conversation?", true);
  }
}

function openProjectModal() {
  const overlay = createModal('Create Project', `
    <div class="search-modal-input-container">
      <input type="text" id="project-name" class="search-modal-input" placeholder="Project Name...">
      <button id="clear-project-name" class="search-modal-clear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <textarea id="project-desc" class="project-input" placeholder="Description..."></textarea>
    <button id="save-project-btn" class="project-btn">Save Project</button>
  `, 'project-modal');

  const nameInput = document.getElementById('project-name');
  const descTextarea = document.getElementById('project-desc');
  const clearBtn = document.getElementById('clear-project-name');
  const saveBtn = document.getElementById('save-project-btn');

  clearBtn.addEventListener('click', () => {
    nameInput.value = '';
    descTextarea.value = '';
    nameInput.focus();
  });

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const desc = descTextarea.value.trim();
    if (name) {
      const project = { name, desc, chats: [] };
      let projects = JSON.parse(localStorage.getItem('projects') || '[]');
      if (projects.some(p => p.name === name)) {
        alert('Project name already exists. Please choose a different name.');
        return;
      }
      projects.push(project);
      localStorage.setItem('projects', JSON.stringify(projects));
      renderProjectList();
      nameInput.value = '';
      descTextarea.value = '';
      overlay.style.display = 'none';
    } else {
      alert('Please enter a project name.');
    }
  });
}

function openAllProjectsModal() {
  const overlay = createModal('All Projects', `
    <div id="all-projects-results" class="search-modal-results"></div>
    <div class="search-modal-delete-all">
      <button id="delete-all-projects-btn" class="search-modal-delete-all-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Delete All Projects
      </button>
    </div>
  `, 'all-projects-modal');

  const results = document.getElementById('all-projects-results');
  const deleteAllBtn = document.getElementById('delete-all-projects-btn');

  renderProjectResults(results);

  deleteAllBtn.addEventListener('click', () => {
    syncCurrentChatMessages();
    localStorage.setItem('projects', JSON.stringify([]));
    renderProjectResults(results);
    renderProjectList();
    if (currentChatType === 'project') {
      currentChatId = null;
      currentChatType = 'global';
      currentProject = null;
      clearChat();
      addMessage("bot", "All projects deleted. Start a new conversation?", true);
    }
  });
}

function renderProjectResults(container) {
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  container.innerHTML = projects.map(project => `
    <div class="history-item" data-project-name="${project.name}">
      <p>${project.name} - ${project.desc || 'No description'}</p>
      <button class="delete-project-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.history-item').forEach(item => {
    const projectName = item.getAttribute('data-project-name');
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn')) {
        openProjectChatsModal(projectName);
      }
    });
    const deleteBtn = item.querySelector('.delete-project-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let projects = JSON.parse(localStorage.getItem('projects') || '[]');
        projects = projects.filter(p => p.name !== projectName);
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjectResults(container);
        renderProjectList();
        if (currentProject === projectName) {
          currentChatId = null;
          currentChatType = 'global';
          currentProject = null;
          clearChat();
          addMessage("bot", "Project deleted. Start a new conversation?", true);
        }
      });
    }
  });
}

function renderProjectList() {
  const list = document.getElementById('project-items');
  if (!list) {
    console.warn('Project items CCT list element not found');
    return;
  }

  let projects = JSON.parse(localStorage.getItem('projects') || '[]');
  const limitedProjects = projects.slice(0, 3);

  list.innerHTML = limitedProjects.map(project => `
    <li>
      <p>${project.name}</p>
      <button class="delete-project-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </li>
  `).join('');

  if (projects.length > 3) {
    const seeAllItem = document.createElement('li');
    seeAllItem.innerHTML = `<p>See All</p>`;
    seeAllItem.addEventListener('click', () => {
      openAllProjectsModal();
    });
    list.appendChild(seeAllItem);
  }

  list.querySelectorAll('li').forEach(item => {
    const projectName = item.querySelector('p')?.textContent;
    if (projectName && projectName !== 'See All') {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-project-btn')) {
          syncCurrentChatMessages();
          openProjectChatsModal(projectName);
          document.getElementById('nav-sidebar').classList.remove('open');
        }
      });
      const deleteBtn = item.querySelector('.delete-project-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          let projects = JSON.parse(localStorage.getItem('projects') || '[]');
          projects = projects.filter(p => p.name !== projectName);
          localStorage.setItem('projects', JSON.stringify(projects));
          renderProjectList();
          if (currentProject === projectName) {
            currentChatId = null;
            currentChatType = 'global';
            lateralStorage.setItem('chatHistory', JSON.stringify(currentHistory));
            currentHistory = [];
            currentProject = null;
            clearChat();
            addMessage("bot", "Project deleted. Start a new conversation?", true);
          }
        });
      }
    }
  });
}

function openProjectChatsModal(projectName) {
  syncCurrentChatMessages();
  currentProject = projectName;
  currentChatType = 'project';
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  const project = projects.find(p => p.name === projectName);
  if (!project) {
    console.error(`Project ${projectName} not found`);
    return;
  }

  const overlay = createModal(`${projectName} Chats`, `
    <div class="search-modal-input-container">
      <input type="text" id="new-chat-name" class="search-modal-input" placeholder="Enter chat name...">
      <button id="create-chat-btn" class="project-btn">Create Chat</button>
    </div>
    <div id="project-chats-results" class="search-modal-results"></div>
  `, 'project-chats-modal');

  const nameInput = document.getElementById('new-chat-name');
  const createBtn = document.getElementById('create-chat-btn');
  const results = document.getElementById('project-chats-results');

  renderProjectChatsResults(project, results);

  createBtn.addEventListener('click', () => {
    const chatName = nameInput.value.trim();
    if (!chatName) {
      alert('Please enter a chat name.');
      return;
    }

    syncCurrentChatMessages();
    clearChat();
    const newId = Date.now();
    const newChat = {
      id: newId,
      timestamp: new Date().toLocaleString(),
      name: chatName,
      messages: []
    };
    project.chats.push(newChat);
    updateProjectInStorage(projectName, project);
    currentChatId = newId;
    currentChatType = 'project';
    currentProject = projectName;
    console.log(`Created new project chat ID: ${newId} in ${projectName}`);

    addMessage("bot", `New chat "${chatName}" started in project! How can I help you today?`, true);
    renderProjectChatsResults(project, results);
    renderRecentHistory();
    nameInput.value = '';
    document.getElementById('nav-sidebar').classList.remove('open');
    document.getElementById('project-chats-modal').style.display = 'none';
  });
}

function renderProjectChatsResults(project, container) {
  const chats = project.chats.slice().reverse();
  if (chats.length === 0) {
    container.innerHTML = `
      <div class="no-chats-placeholder">
        <p>Create a chat to get started</p>
      </div>
    `;
    return;
  }

  container.innerHTML = chats.map(chat => `
    <div class="history-item" data-chat-id="${chat.id}">
      <p>${chat.name}</p>
      <button class="delete-chat-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.history-item').forEach(item => {
    const chatId = parseInt(item.getAttribute('data-chat-id'));
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-chat-btn')) {
        syncCurrentChatMessages();
        loadChat(chatId, project.name);
        document.getElementById('project-chats-modal').style.display = 'none';
        document.getElementById('nav-sidebar').classList.remove('open');
      }
    });
    const deleteBtn = item.querySelector('.delete-chat-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        project.chats = project.chats.filter(c => c.id !== chatId);
        updateProjectInStorage(project.name, project);
        renderProjectChatsResults(project, container);
        renderRecentHistory();
        if (currentChatId === chatId) {
          currentChatId = null;
          currentChatType = 'global';
          currentProject = null;
          clearChat();
          addMessage("bot", "Chat deleted. Start a new conversation?", true);
        }
      });
    }
  });
}

export function updateProjectInStorage(projectName, updatedProject) {
  let projects = JSON.parse(localStorage.getItem('projects') || '[]');
  projects = projects.map(p => p.name === projectName ? updatedProject : p);
  localStorage.setItem('projects', JSON.stringify(projects));
}

function createModal(title, content, id) {
  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.classList.add('search-modal-overlay');
    overlay.innerHTML = `
      <div class="search-modal-content">
        <div class="search-modal-header">
          <h3 class="search-modal-title">${title}</h3>
          <button class="search-modal-close">&times;</button>
        </div>
        ${content}
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.search-modal-close').addEventListener('click', () => overlay.style.display = 'none');
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
  }
  overlay.style.display = 'flex';
  return overlay;
}