const views = {
  list: document.querySelector("#listView"),
  calendar: document.querySelector("#calendarView"),
  settings: document.querySelector("#settingsView"),
};

const tabButtons = document.querySelectorAll(".tab-button");
const jumpCalendarButton = document.querySelector("#jumpCalendarButton");
const searchButton = document.querySelector("#searchButton");
const searchPanel = document.querySelector("#searchPanel");
const searchInput = document.querySelector("#searchInput");
const listMonthLabel = document.querySelector("#listMonthLabel");
const entryList = document.querySelector("#entryList");
const calendarEntryList = document.querySelector("#calendarEntryList");
const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const weekdayRow = document.querySelector("#weekdayRow");
const selectedDateHeading = document.querySelector("#selectedDateHeading");
const prevMonthButton = document.querySelector("#prevMonthButton");
const nextMonthButton = document.querySelector("#nextMonthButton");
const todayButton = document.querySelector("#todayButton");
const composeButton = document.querySelector("#composeButton");
const hideAdButton = document.querySelector("#hideAdButton");
const adBanner = document.querySelector(".ad-banner");
const editorDialog = document.querySelector("#editorDialog");
const diaryForm = document.querySelector("#diaryForm");
const closeEditorButton = document.querySelector("#closeEditorButton");
const entryDate = document.querySelector("#entryDate");
const entryTitle = document.querySelector("#entryTitle");
const entryBody = document.querySelector("#entryBody");
const deleteEntryButton = document.querySelector("#deleteEntryButton");
const listRowsSetting = document.querySelector("#listRowsSetting");
const weekStartSetting = document.querySelector("#weekStartSetting");
const reminderSetting = document.querySelector("#reminderSetting");
const passcodeSetting = document.querySelector("#passcodeSetting");
const deleteMonthButton = document.querySelector("#deleteMonthButton");
const deleteAllButton = document.querySelector("#deleteAllButton");

const STORAGE_KEY = "diary-app.entries";
const SETTINGS_KEY = "diary-app.settings";
const monthFormatter = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" });
const fullDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});
const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
});
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

let currentView = ["list", "calendar", "settings"].includes(location.hash.slice(1))
  ? location.hash.slice(1)
  : "list";
let selectedDate = getToday();
let visibleMonth = startOfMonth(fromDateKey(selectedDate));
let editingId = null;
let settings = loadSettings();

function getToday() {
  return toDateKey(new Date());
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function loadEntries() {
  const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (entries.length > 0) return entries;

  const now = new Date();
  return [
    {
      id: crypto.randomUUID(),
      date: getToday(),
      title: "日記始めてみる",
      body: "今日から日記をつけ始める。短くても、その日のことを残していく。",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadSettings() {
  return {
    listRows: "4",
    weekStart: "0",
    reminder: false,
    passcode: true,
    ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
  };
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getEntryForDate(dateKey) {
  return loadEntries().find((entry) => entry.date === dateKey) || null;
}

function getSortedEntries() {
  const query = searchInput.value.trim().toLowerCase();
  return loadEntries()
    .filter((entry) => {
      const text = `${entry.date} ${entry.title} ${entry.body}`.toLowerCase();
      return text.includes(query);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
}

function switchView(viewName) {
  currentView = viewName;
  document.body.dataset.view = viewName;
  if (location.hash.slice(1) !== viewName) {
    history.replaceState(null, "", `#${viewName}`);
  }
  Object.entries(views).forEach(([name, view]) => {
    view.classList.toggle("is-active", name === viewName);
  });
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });
  composeButton.hidden = viewName === "settings";
  render();
}

function formatEntryTime(entry) {
  const source = entry.createdAt || entry.updatedAt || new Date().toISOString();
  return timeFormatter.format(new Date(source));
}

function createEntryCard(entry) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  const date = fromDateKey(entry.date);

  item.className = "entry-item";
  button.type = "button";
  button.className = "entry-card";
  button.addEventListener("click", () => {
    selectedDate = entry.date;
    visibleMonth = startOfMonth(date);
    openEditor(entry);
  });

  const dateBox = document.createElement("div");
  dateBox.className = "entry-date-box";

  const weekday = document.createElement("span");
  weekday.className = "entry-weekday";
  weekday.textContent = weekdays[date.getDay()];

  const day = document.createElement("span");
  day.className = "entry-day";
  day.textContent = date.getDate();

  const time = document.createElement("span");
  time.className = "entry-time";
  time.textContent = formatEntryTime(entry);

  const bodyBox = document.createElement("div");
  bodyBox.className = "entry-body-box";

  const title = document.createElement("p");
  title.className = "entry-title";
  title.textContent = entry.title;

  const preview = document.createElement("p");
  preview.className = "entry-preview";
  preview.textContent = entry.body;

  dateBox.append(weekday, day, time);
  bodyBox.append(title, preview);
  button.append(dateBox, bodyBox);
  item.replaceChildren(button);
  return item;
}

function renderList() {
  const entries = getSortedEntries();
  const visibleMonthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthEntries = entries.filter((entry) => entry.date.startsWith(visibleMonthKey));

  listMonthLabel.textContent = monthFormatter.format(visibleMonth);
  entryList.innerHTML = "";
  document.documentElement.style.setProperty("--list-lines", settings.listRows);

  if (monthEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "この月の日記はありません。";
    entryList.append(empty);
    return;
  }

  monthEntries.forEach((entry) => entryList.append(createEntryCard(entry)));
}

function renderWeekdays() {
  const start = Number(settings.weekStart);
  const orderedWeekdays = [...weekdays.slice(start), ...weekdays.slice(0, start)];
  weekdayRow.innerHTML = "";
  orderedWeekdays.forEach((weekday) => {
    const item = document.createElement("span");
    item.textContent = weekday;
    weekdayRow.append(item);
  });
}

function renderCalendar() {
  const entries = loadEntries();
  const entryDates = new Set(entries.map((entry) => entry.date));
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const first = new Date(year, month, 1);
  const weekStart = Number(settings.weekStart);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);

  calendarTitle.textContent = monthFormatter.format(visibleMonth);
  calendarGrid.innerHTML = "";
  renderWeekdays();

  for (let index = 0; index < 35; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const dateKey = toDateKey(date);

    const button = document.createElement("button");
    const label = document.createElement("span");
    button.type = "button";
    button.className = "calendar-day";
    label.textContent = date.getDate();
    button.append(label);

    if (date.getMonth() !== month) button.classList.add("is-outside");
    if (dateKey === selectedDate) button.classList.add("is-selected");
    if (entryDates.has(dateKey)) button.classList.add("has-entry");

    button.addEventListener("click", () => {
      selectedDate = dateKey;
      visibleMonth = startOfMonth(date);
      render();
    });

    calendarGrid.append(button);
  }

  selectedDateHeading.textContent = fullDateFormatter.format(fromDateKey(selectedDate));
  calendarEntryList.innerHTML = "";

  const selectedEntry = getEntryForDate(selectedDate);
  if (selectedEntry) {
    calendarEntryList.append(createEntryCard(selectedEntry));
  } else {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "この日の記録はありません。";
    calendarEntryList.append(empty);
  }
}

function renderSettings() {
  listRowsSetting.value = settings.listRows;
  weekStartSetting.value = settings.weekStart;
  reminderSetting.checked = settings.reminder;
  passcodeSetting.checked = settings.passcode;
}

function render() {
  renderList();
  renderCalendar();
  renderSettings();
}

function openEditor(entry = null) {
  const targetEntry = entry || getEntryForDate(selectedDate);
  editingId = targetEntry?.id || null;
  entryDate.value = targetEntry?.date || selectedDate;
  entryTitle.value = targetEntry?.title || "";
  entryBody.value = targetEntry?.body || "";
  deleteEntryButton.hidden = !targetEntry;

  if (typeof editorDialog.showModal === "function") {
    editorDialog.showModal();
  } else {
    editorDialog.setAttribute("open", "");
  }

  entryTitle.focus();
}

function closeEditor() {
  editorDialog.close();
}

function saveEntry() {
  const entries = loadEntries();
  const now = new Date().toISOString();
  const dateKey = entryDate.value || selectedDate;
  const existingEntry = editingId
    ? entries.find((entry) => entry.id === editingId)
    : entries.find((entry) => entry.date === dateKey);

  const nextEntry = {
    id: existingEntry?.id || crypto.randomUUID(),
    date: dateKey,
    title: entryTitle.value.trim(),
    body: entryBody.value.trim(),
    createdAt: existingEntry?.createdAt || now,
    updatedAt: now,
  };

  const nextEntries = existingEntry
    ? entries.map((entry) => (entry.id === existingEntry.id ? nextEntry : entry))
    : [...entries, nextEntry];

  selectedDate = dateKey;
  visibleMonth = startOfMonth(fromDateKey(dateKey));
  saveEntries(nextEntries);
  closeEditor();
  render();
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

jumpCalendarButton.addEventListener("click", () => switchView("calendar"));

searchButton.addEventListener("click", () => {
  searchPanel.hidden = !searchPanel.hidden;
  if (!searchPanel.hidden) searchInput.focus();
});

searchInput.addEventListener("input", render);

prevMonthButton.addEventListener("click", () => {
  visibleMonth = shiftMonth(visibleMonth, -1);
  render();
});

nextMonthButton.addEventListener("click", () => {
  visibleMonth = shiftMonth(visibleMonth, 1);
  render();
});

todayButton.addEventListener("click", () => {
  selectedDate = getToday();
  visibleMonth = startOfMonth(fromDateKey(selectedDate));
  render();
});

composeButton.addEventListener("click", () => openEditor());

hideAdButton.addEventListener("click", () => {
  adBanner.classList.add("is-hidden");
});

closeEditorButton.addEventListener("click", closeEditor);

diaryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveEntry();
});

deleteEntryButton.addEventListener("click", () => {
  if (!editingId) return;
  const nextEntries = loadEntries().filter((entry) => entry.id !== editingId);
  saveEntries(nextEntries);
  editingId = null;
  closeEditor();
  render();
});

listRowsSetting.addEventListener("change", () => {
  settings.listRows = listRowsSetting.value;
  saveSettings();
  render();
});

weekStartSetting.addEventListener("change", () => {
  settings.weekStart = weekStartSetting.value;
  saveSettings();
  render();
});

reminderSetting.addEventListener("change", () => {
  settings.reminder = reminderSetting.checked;
  saveSettings();
});

passcodeSetting.addEventListener("change", () => {
  settings.passcode = passcodeSetting.checked;
  saveSettings();
});

deleteMonthButton.addEventListener("click", () => {
  const monthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
  if (!confirm(`${monthFormatter.format(visibleMonth)}の日記を削除しますか？`)) return;
  saveEntries(loadEntries().filter((entry) => !entry.date.startsWith(monthKey)));
  render();
});

deleteAllButton.addEventListener("click", () => {
  if (!confirm("すべての日記を削除しますか？")) return;
  saveEntries([]);
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

switchView(currentView);
