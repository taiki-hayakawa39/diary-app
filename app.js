const diaryForm = document.querySelector("#diaryForm");
const entryDate = document.querySelector("#entryDate");
const entryTitle = document.querySelector("#entryTitle");
const entryBody = document.querySelector("#entryBody");
const entryList = document.querySelector("#entryList");
const searchInput = document.querySelector("#searchInput");
const clearButton = document.querySelector("#clearButton");
const installButton = document.querySelector("#installButton");

const STORAGE_KEY = "diary-app.entries";
let editingId = null;
let deferredInstallPrompt = null;

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function resetForm() {
  editingId = null;
  diaryForm.reset();
  entryDate.value = getToday();
  entryTitle.focus();
}

function renderEntries() {
  const query = searchInput.value.trim().toLowerCase();
  const entries = loadEntries()
    .filter((entry) => {
      const text = `${entry.date} ${entry.title} ${entry.body}`.toLowerCase();
      return text.includes(query);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));

  entryList.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = query ? "一致する日記はありません。" : "まだ日記はありません。";
    entryList.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "entry-card";

    const button = document.createElement("button");
    button.type = "button";
    button.addEventListener("click", () => editEntry(entry.id));

    const date = document.createElement("div");
    date.className = "entry-date";
    date.textContent = entry.date;

    const title = document.createElement("div");
    title.className = "entry-title";
    title.textContent = entry.title;

    const preview = document.createElement("div");
    preview.className = "entry-preview";
    preview.textContent = entry.body.length > 90 ? `${entry.body.slice(0, 90)}...` : entry.body;

    button.append(date, title, preview);
    item.append(button);
    entryList.append(item);
  });
}

function editEntry(id) {
  const entry = loadEntries().find((item) => item.id === id);
  if (!entry) return;

  editingId = id;
  entryDate.value = entry.date;
  entryTitle.value = entry.title;
  entryBody.value = entry.body;
  entryTitle.focus();
}

diaryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const entries = loadEntries();
  const now = new Date().toISOString();
  const nextEntry = {
    id: editingId || crypto.randomUUID(),
    date: entryDate.value,
    title: entryTitle.value.trim(),
    body: entryBody.value.trim(),
    updatedAt: now,
  };

  const nextEntries = editingId
    ? entries.map((entry) => (entry.id === editingId ? nextEntry : entry))
    : [...entries, nextEntry];

  saveEntries(nextEntries);
  resetForm();
  renderEntries();
});

clearButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderEntries);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

entryDate.value = getToday();
renderEntries();
