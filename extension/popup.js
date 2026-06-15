const BACKEND_URL = "https://memorypal-c9m8.onrender.com";

let tags = [];

// --- Storage helpers ---

function getToken() {
  return new Promise(resolve => {
    chrome.storage.local.get("memorypal_token", result => {
      resolve(result.memorypal_token || null);
    });
  });
}

function setToken(token) {
  return new Promise(resolve => {
    chrome.storage.local.set({ memorypal_token: token }, resolve);
  });
}

function clearToken() {
  return new Promise(resolve => {
    chrome.storage.local.remove("memorypal_token", resolve);
  });
}

// --- View helpers ---

function showView(id) {
  ["login-view", "save-view", "success-view"].forEach(v => {
    document.getElementById(v).style.display = v === id ? "block" : "none";
  });
}

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.style.display = "block";
}

function hideError(id) {
  document.getElementById(id).style.display = "none";
}

// --- Tag management ---

function renderTags() {
  const row = document.getElementById("tag-row");
  row.innerHTML = "";
  tags.forEach(tag => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.innerHTML = `#${tag} <button class="tag-remove" data-tag="${tag}">&times;</button>`;
    row.appendChild(chip);
  });
  row.querySelectorAll(".tag-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      tags = tags.filter(t => t !== btn.dataset.tag);
      renderTags();
    });
  });
}

function addTag(value) {
  const normalized = value.trim().toLowerCase().replace(/,/g, "").replace(/^#/, "");
  if (normalized && !tags.includes(normalized)) {
    tags.push(normalized);
    renderTags();
  }
  document.getElementById("tag-input").value = "";
}

// --- Auto-fill from current tab or context menu ---

async function fillFromTab() {
  try {
    // Check if opened via context menu (right-click on a link)
    const session = await new Promise(resolve => {
      chrome.storage.session.get("memorypal_context_url", result => {
        resolve(result.memorypal_context_url || null);
      });
    });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const titleInput = document.getElementById("note-title");
    const urlInput = document.getElementById("note-url");

    if (tab) {
      if (tab.title && !titleInput.value) titleInput.value = tab.title;
    }

    // Context menu URL takes priority over tab URL
    const finalUrl = session || (tab && tab.url) || "";
    if (finalUrl && !urlInput.value) urlInput.value = finalUrl;

    // Clear the session key so it doesn't persist to next open
    if (session) chrome.storage.session.remove("memorypal_context_url");
  } catch {
    // Tabs API might not be available for all page types
  }
}

// --- Login ---

async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  if (!username || !password) {
    showError("login-error", "Please enter your username and password.");
    return;
  }

  hideError("login-error");
  const btn = document.getElementById("login-btn");
  btn.disabled = true;
  btn.textContent = "Signing in...";

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (!response.ok || !data.token) {
      showError("login-error", data.message || "Incorrect credentials.");
      return;
    }

    await setToken(data.token);
    document.getElementById("status-dot").classList.add("connected");
    tags = [];
    await fillFromTab();
    showView("save-view");
  } catch {
    showError("login-error", "Could not connect to MemoryPal. Check your connection.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

// --- Save note ---

async function handleSave() {
  const title = document.getElementById("note-title").value.trim();
  const url = document.getElementById("note-url").value.trim();
  const description = document.getElementById("note-desc").value.trim();

  if (!title) {
    showError("save-error", "Title is required.");
    return;
  }

  hideError("save-error");
  const btn = document.getElementById("save-btn");
  btn.disabled = true;
  btn.textContent = "Saving...";

  const token = await getToken();
  const links = url ? [url] : [];

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ title, links, description, tags })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showError("save-error", data.message || "Failed to save. Please try again.");
      return;
    }

    showView("success-view");
    setTimeout(() => window.close(), 1800);
  } catch {
    showError("save-error", "Could not connect to MemoryPal. Check your connection.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save to MemoryPal";
  }
}

// --- Logout ---

async function handleLogout() {
  await clearToken();
  document.getElementById("status-dot").classList.remove("connected");
  tags = [];
  showView("login-view");
}

// --- Init ---

async function init() {
  const token = await getToken();

  if (token) {
    document.getElementById("status-dot").classList.add("connected");
    await fillFromTab();
    showView("save-view");
  } else {
    showView("login-view");
  }
}

// --- Event listeners ---

document.addEventListener("DOMContentLoaded", () => {
  init();

  document.getElementById("login-btn").addEventListener("click", handleLogin);

  document.getElementById("password").addEventListener("keydown", e => {
    if (e.key === "Enter") handleLogin();
  });

  document.getElementById("save-btn").addEventListener("click", handleSave);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  document.getElementById("tag-add-btn").addEventListener("click", () => {
    addTag(document.getElementById("tag-input").value);
  });

  document.getElementById("tag-input").addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(document.getElementById("tag-input").value);
    }
  });
});
