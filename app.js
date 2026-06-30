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
const listReviewButton = document.querySelector("#listReviewButton");
const entryList = document.querySelector("#entryList");
const calendarEntryList = document.querySelector("#calendarEntryList");
const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const weekdayRow = document.querySelector("#weekdayRow");
const selectedDateHeading = document.querySelector("#selectedDateHeading");
const calendarReviewButton = document.querySelector("#calendarReviewButton");
const prevMonthButton = document.querySelector("#prevMonthButton");
const nextMonthButton = document.querySelector("#nextMonthButton");
const todayButton = document.querySelector("#todayButton");
const composeButton = document.querySelector("#composeButton");
const editorDialog = document.querySelector("#editorDialog");
const diaryForm = document.querySelector("#diaryForm");
const closeEditorButton = document.querySelector("#closeEditorButton");
const editorTitle = document.querySelector("#editorTitle");
const editorTimeLabel = document.querySelector("#editorTimeLabel");
const modeMenuButton = document.querySelector("#modeMenuButton");
const modeMenu = document.querySelector("#modeMenu");
const entryDate = document.querySelector("#entryDate");
const entryTitle = document.querySelector("#entryTitle");
const entryBody = document.querySelector("#entryBody");
const memoryQuote = document.querySelector("#memoryQuote");
const memoryFeeling = document.querySelector("#memoryFeeling");
const bookTitle = document.querySelector("#bookTitle");
const bookHighlight = document.querySelector("#bookHighlight");
const bookThought = document.querySelector("#bookThought");
const photoInput = document.querySelector("#photoInput");
const photoPreviewList = document.querySelector("#photoPreviewList");
const addPhotoTileButton = document.querySelector("#addPhotoTileButton");
const addPhotoButton = document.querySelector("#addPhotoButton");
const takePhotoButton = document.querySelector("#takePhotoButton");
const deleteEntryButton = document.querySelector("#deleteEntryButton");
const listRowsSetting = document.querySelector("#listRowsSetting");
const weekStartSetting = document.querySelector("#weekStartSetting");
const defaultModeSetting = document.querySelector("#defaultModeSetting");
const reminderSetting = document.querySelector("#reminderSetting");
const passcodeSetting = document.querySelector("#passcodeSetting");
const deleteMonthButton = document.querySelector("#deleteMonthButton");
const deleteAllButton = document.querySelector("#deleteAllButton");
const reviewDialog = document.querySelector("#reviewDialog");
const closeReviewButton = document.querySelector("#closeReviewButton");
const reviewTitle = document.querySelector("#reviewTitle");
const reviewEmptyState = document.querySelector("#reviewEmptyState");
const reviewSlide = document.querySelector("#reviewSlide");
const reviewPhotoFrame = document.querySelector("#reviewPhotoFrame");
const reviewPhoto = document.querySelector("#reviewPhoto");
const reviewDate = document.querySelector("#reviewDate");
const reviewSlideTitle = document.querySelector("#reviewSlideTitle");
const reviewSlideBody = document.querySelector("#reviewSlideBody");
const reviewProgressBar = document.querySelector("#reviewProgressBar");
const prevReviewButton = document.querySelector("#prevReviewButton");
const playReviewButton = document.querySelector("#playReviewButton");
const nextReviewButton = document.querySelector("#nextReviewButton");
const reviewCounter = document.querySelector("#reviewCounter");
const themeColorLabel = document.querySelector("#themeColorLabel");
const textSettingLabel = document.querySelector("#textSettingLabel");
const fontStyleLabel = document.querySelector("#fontStyleLabel");
const themeColorRow = document.querySelector("#themeColorRow");
const textSettingRow = document.querySelector("#textSettingRow");
const fontStyleRow = document.querySelector("#fontStyleRow");
const themeColorOptions = document.querySelector("#themeColorOptions");
const textSettingOptions = document.querySelector("#textSettingOptions");
const fontStyleOptions = document.querySelector("#fontStyleOptions");

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
const editorDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "long",
  day: "numeric",
  weekday: "short",
});
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const themeLabels = {
  mint: "ミント",
  sakura: "さくら",
  sky: "空",
  lemon: "レモン",
  lavender: "ラベンダー",
  mono: "モノクロ",
};
const fontLabels = {
  system: "標準",
  serif: "明朝",
  rounded: "丸ゴシック",
  handwriting: "手書き風",
};
const textSizeLabels = {
  small: "小さめ",
  normal: "標準",
  large: "大きめ",
  xlarge: "特大",
};
const lineHeightLabels = {
  compact: "せまい",
  normal: "標準",
  relaxed: "広め",
};
const modeLabels = {
  normal: "通常",
  memory: "思い出",
  book: "book",
};

let currentView = ["list", "calendar", "settings"].includes(location.hash.slice(1))
  ? location.hash.slice(1)
  : "list";
let selectedDate = getToday();
let visibleMonth = startOfMonth(fromDateKey(selectedDate));
let editingId = null;
let draftPhotos = [];
let activeEntryMode = "normal";
let reviewSlides = [];
let reviewSlideIndex = 0;
let reviewTimer = null;
let settings = loadSettings();
let expandedSetting = null;

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
    themeColor: "mint",
    textSize: "normal",
    lineHeight: "normal",
    fontStyle: "system",
    defaultMode: "normal",
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

function applyAppearance() {
  document.body.dataset.theme = settings.themeColor;
  document.body.dataset.font = settings.fontStyle;
  document.body.dataset.textSize = settings.textSize;
  document.body.dataset.lineHeight = settings.lineHeight;
}

function getEntryForDate(dateKey) {
  return loadEntries().find((entry) => entry.date === dateKey) || null;
}

function deleteEntryById(entryId, entryTitle) {
  if (!confirm(`「${entryTitle}」を削除しますか？`)) return;
  saveEntries(loadEntries().filter((entry) => entry.id !== entryId));
  if (editingId === entryId) editingId = null;
  render();
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

function formatEditorDate(dateKey) {
  return editorDateFormatter.format(fromDateKey(dateKey)).replace("曜日", "");
}

function deriveTitle(body, fallbackDate) {
  const firstLine = body
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  return (firstLine || `${formatEditorDate(fallbackDate)}の日記`).slice(0, 60);
}

function getEntryTitle(entry) {
  if (entry.mode === "memory") {
    return entry.title || "思い出メモ";
  }
  if (entry.mode === "book") {
    return entry.book?.title || entry.title || "bookメモ";
  }
  return entry.title;
}

function getEntryPreview(entry) {
  if (entry.mode === "memory") {
    const quote = entry.memory?.quote ? `「${entry.memory.quote}」` : "";
    const feeling = entry.memory?.feeling || "";
    return [quote, feeling].filter(Boolean).join("\n");
  }
  if (entry.mode === "book") {
    const highlight = entry.book?.highlight ? `印象的だった内容: ${entry.book.highlight}` : "";
    const thought = entry.book?.thought ? `感想: ${entry.book.thought}` : "";
    return [highlight, thought].filter(Boolean).join("\n");
  }
  return entry.body;
}

function getModeBody(mode) {
  if (mode === "memory") {
    return [memoryQuote.value.trim(), memoryFeeling.value.trim()].filter(Boolean).join("\n");
  }
  if (mode === "book") {
    return [bookTitle.value.trim(), bookHighlight.value.trim(), bookThought.value.trim()]
      .filter(Boolean)
      .join("\n");
  }
  return entryBody.value.trim();
}

function getVisibleMonthKey() {
  return `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthEntries() {
  const monthKey = getVisibleMonthKey();
  return loadEntries()
    .filter((entry) => entry.date.startsWith(monthKey))
    .sort((a, b) => a.date.localeCompare(b.date) || a.updatedAt.localeCompare(b.updatedAt));
}

function buildReviewSlides() {
  return getMonthEntries().map((entry) => {
    const photos = Array.isArray(entry.photos) ? entry.photos : [];
    return {
      date: fullDateFormatter.format(fromDateKey(entry.date)),
      title: getEntryTitle(entry),
      body: getEntryPreview(entry) || "写真だけの日記",
      photo: photos[0] || null,
    };
  });
}

function stopReviewPlayback() {
  if (reviewTimer) {
    clearInterval(reviewTimer);
    reviewTimer = null;
  }
  playReviewButton.textContent = "再生";
}

function renderReviewSlide() {
  const hasSlides = reviewSlides.length > 0;
  reviewEmptyState.hidden = hasSlides;
  reviewSlide.hidden = !hasSlides;
  prevReviewButton.disabled = !hasSlides;
  playReviewButton.disabled = !hasSlides;
  nextReviewButton.disabled = !hasSlides;

  if (!hasSlides) {
    reviewProgressBar.style.width = "0%";
    reviewCounter.textContent = "";
    reviewPhotoFrame.hidden = true;
    return;
  }

  const slide = reviewSlides[reviewSlideIndex];
  reviewDate.textContent = slide.date;
  reviewSlideTitle.textContent = slide.title;
  reviewSlideBody.textContent = slide.body;
  reviewCounter.textContent = `${reviewSlideIndex + 1} / ${reviewSlides.length}`;
  reviewProgressBar.style.width = `${((reviewSlideIndex + 1) / reviewSlides.length) * 100}%`;

  if (slide.photo) {
    reviewPhoto.src = slide.photo.src;
    reviewPhoto.alt = slide.photo.name || "振り返り写真";
    reviewPhotoFrame.hidden = false;
  } else {
    reviewPhoto.removeAttribute("src");
    reviewPhotoFrame.hidden = true;
  }
}

function moveReviewSlide(amount) {
  if (reviewSlides.length === 0) return;
  reviewSlideIndex = (reviewSlideIndex + amount + reviewSlides.length) % reviewSlides.length;
  renderReviewSlide();
}

function toggleReviewPlayback() {
  if (reviewSlides.length === 0) return;
  if (reviewTimer) {
    stopReviewPlayback();
    return;
  }

  playReviewButton.textContent = "停止";
  reviewTimer = setInterval(() => {
    moveReviewSlide(1);
  }, 3200);
}

function openMonthlyReview() {
  reviewSlides = buildReviewSlides();
  reviewSlideIndex = 0;
  reviewTitle.textContent = `${monthFormatter.format(visibleMonth)}の振り返り`;
  stopReviewPlayback();
  renderReviewSlide();

  if (typeof reviewDialog.showModal === "function") {
    reviewDialog.showModal();
  } else {
    reviewDialog.setAttribute("open", "");
  }
}

function closeMonthlyReview() {
  stopReviewPlayback();
  if (typeof reviewDialog.close === "function") {
    reviewDialog.close();
  } else {
    reviewDialog.removeAttribute("open");
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = dataUrl;
  });
}

async function resizePhoto(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSize = 1280;
  const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    src: canvas.toDataURL("image/jpeg", 0.82),
    addedAt: new Date().toISOString(),
  };
}

function renderPhotoPreviews() {
  photoPreviewList.innerHTML = "";
  photoPreviewList.hidden = draftPhotos.length === 0;

  draftPhotos.forEach((photo) => {
    const item = document.createElement("figure");
    const image = document.createElement("img");
    const removeButton = document.createElement("button");

    item.className = "photo-preview-item";
    image.src = photo.src;
    image.alt = photo.name || "日記に挿入した写真";
    removeButton.type = "button";
    removeButton.className = "remove-photo-button";
    removeButton.textContent = "×";
    removeButton.title = "写真を削除";
    removeButton.addEventListener("click", () => {
      draftPhotos = draftPhotos.filter((itemPhoto) => itemPhoto.id !== photo.id);
      renderPhotoPreviews();
    });

    item.append(image, removeButton);
    photoPreviewList.append(item);
  });
}

async function handlePhotoFiles(files) {
  const imageFiles = [...files].filter((file) => file.type.startsWith("image/"));
  if (imageFiles.length === 0) return;

  addPhotoButton.disabled = true;
  takePhotoButton.disabled = true;

  try {
    const photos = await Promise.all(imageFiles.map(resizePhoto));
    draftPhotos = [...draftPhotos, ...photos].slice(0, 9);
    renderPhotoPreviews();
  } finally {
    addPhotoButton.disabled = false;
    takePhotoButton.disabled = false;
    photoInput.value = "";
  }
}

function createEntryCard(entry) {
  const item = document.createElement("li");
  const card = document.createElement("div");
  const openButton = document.createElement("button");
  const quickDeleteButton = document.createElement("button");
  const date = fromDateKey(entry.date);
  const entryTitle = getEntryTitle(entry);

  item.className = "entry-item";
  card.className = "entry-card";
  openButton.type = "button";
  openButton.className = "entry-card-main";
  openButton.addEventListener("click", () => {
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
  title.textContent = entryTitle;

  const preview = document.createElement("p");
  preview.className = "entry-preview";
  preview.textContent = getEntryPreview(entry);

  const photos = Array.isArray(entry.photos) ? entry.photos : [];
  if (photos.length > 0) {
    const strip = document.createElement("div");
    strip.className = "entry-photo-strip";
    photos.slice(0, 3).forEach((photo) => {
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.name || "日記の写真";
      strip.append(image);
    });
    bodyBox.append(title, preview, strip);
  } else {
    bodyBox.append(title, preview);
  }

  dateBox.append(weekday, day, time);
  openButton.append(dateBox, bodyBox);

  quickDeleteButton.type = "button";
  quickDeleteButton.className = "entry-delete-quick-button";
  quickDeleteButton.setAttribute("aria-label", "この日記を削除");
  quickDeleteButton.title = "この日記を削除";
  quickDeleteButton.textContent = "削除";
  quickDeleteButton.addEventListener("click", () => {
    deleteEntryById(entry.id, entryTitle);
  });

  card.append(openButton, quickDeleteButton);
  item.replaceChildren(card);
  return item;
}

function renderList() {
  const entries = getSortedEntries();
  const visibleMonthKey = getVisibleMonthKey();
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
  themeColorLabel.textContent = themeLabels[settings.themeColor] || themeLabels.mint;
  textSettingLabel.textContent = `${textSizeLabels[settings.textSize] || textSizeLabels.normal} / ${
    lineHeightLabels[settings.lineHeight] || lineHeightLabels.normal
  }`;
  fontStyleLabel.textContent = fontLabels[settings.fontStyle] || fontLabels.system;
  listRowsSetting.value = settings.listRows;
  weekStartSetting.value = settings.weekStart;
  defaultModeSetting.value = settings.defaultMode;
  reminderSetting.checked = settings.reminder;
  passcodeSetting.checked = settings.passcode;

  themeColorOptions.querySelectorAll("[data-theme]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.theme === settings.themeColor);
  });
  textSettingOptions.querySelectorAll("[data-text-size]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.textSize === settings.textSize);
  });
  textSettingOptions.querySelectorAll("[data-line-height]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.lineHeight === settings.lineHeight);
  });
  fontStyleOptions.querySelectorAll("[data-font]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.font === settings.fontStyle);
  });

  syncExpandableSetting(themeColorRow, themeColorOptions, expandedSetting === "theme");
  syncExpandableSetting(textSettingRow, textSettingOptions, expandedSetting === "text");
  syncExpandableSetting(fontStyleRow, fontStyleOptions, expandedSetting === "font");
}

function setEntryMode(mode) {
  activeEntryMode = modeLabels[mode] ? mode : "normal";
  document.querySelectorAll("[data-mode-field]").forEach((field) => {
    field.hidden = field.dataset.modeField !== activeEntryMode;
  });
  modeMenu.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.mode === activeEntryMode);
  });
}

function toggleModeMenu(forceOpen = null) {
  const nextOpen = forceOpen ?? modeMenu.hidden;
  modeMenu.hidden = !nextOpen;
  modeMenuButton.setAttribute("aria-expanded", String(nextOpen));
}

function syncExpandableSetting(row, options, isExpanded) {
  row.setAttribute("aria-expanded", String(isExpanded));
  row.querySelector(".chevron").textContent = isExpanded ? "⌄" : "›";
  options.hidden = !isExpanded;
}

function toggleSettingPanel(panelName) {
  expandedSetting = expandedSetting === panelName ? null : panelName;
  renderSettings();
}

function render() {
  applyAppearance();
  renderList();
  renderCalendar();
  renderSettings();
}

function openEditor(entry = null, options = {}) {
  const targetEntry = options.blank ? null : entry || getEntryForDate(selectedDate);
  const dateKey = targetEntry?.date || selectedDate;
  const timestamp = targetEntry?.createdAt || targetEntry?.updatedAt || new Date().toISOString();
  const mode = targetEntry?.mode || (options.blank ? settings.defaultMode : "normal");
  editingId = targetEntry?.id || null;
  entryDate.value = dateKey;
  entryTitle.value = targetEntry?.title || "";
  entryBody.value = mode === "normal" ? targetEntry?.body || "" : "";
  memoryQuote.value = targetEntry?.memory?.quote || "";
  memoryFeeling.value = targetEntry?.memory?.feeling || "";
  bookTitle.value = targetEntry?.book?.title || "";
  bookHighlight.value = targetEntry?.book?.highlight || "";
  bookThought.value = targetEntry?.book?.thought || "";
  draftPhotos = Array.isArray(targetEntry?.photos) ? [...targetEntry.photos] : [];
  editorTitle.textContent = formatEditorDate(dateKey);
  editorTimeLabel.textContent = timeFormatter.format(new Date(timestamp));
  deleteEntryButton.hidden = !targetEntry;
  setEntryMode(mode);
  toggleModeMenu(false);
  renderPhotoPreviews();

  if (typeof editorDialog.showModal === "function") {
    editorDialog.showModal();
  } else {
    editorDialog.setAttribute("open", "");
  }

  requestAnimationFrame(() => {
    if (activeEntryMode === "memory") memoryQuote.focus();
    else if (activeEntryMode === "book") bookTitle.focus();
    else entryBody.focus();
  });
}

function closeEditor() {
  if (typeof editorDialog.close === "function") {
    editorDialog.close();
  } else {
    editorDialog.removeAttribute("open");
  }
}

function saveEntry() {
  const entries = loadEntries();
  const now = new Date().toISOString();
  const dateKey = entryDate.value || selectedDate;
  const body = getModeBody(activeEntryMode);
  if (!body && draftPhotos.length === 0) {
    if (activeEntryMode === "memory") memoryQuote.focus();
    else if (activeEntryMode === "book") bookTitle.focus();
    else entryBody.focus();
    return;
  }

  const existingEntry = editingId
    ? entries.find((entry) => entry.id === editingId)
    : entries.find((entry) => entry.date === dateKey);

  const nextEntry = {
    id: existingEntry?.id || crypto.randomUUID(),
    date: dateKey,
    mode: activeEntryMode,
    title:
      entryTitle.value.trim() ||
      (activeEntryMode === "book" ? bookTitle.value.trim() : "") ||
      (activeEntryMode === "memory" ? "思い出メモ" : "") ||
      deriveTitle(body, dateKey),
    body,
    memory:
      activeEntryMode === "memory"
        ? {
            quote: memoryQuote.value.trim(),
            feeling: memoryFeeling.value.trim(),
          }
        : undefined,
    book:
      activeEntryMode === "book"
        ? {
            title: bookTitle.value.trim(),
            highlight: bookHighlight.value.trim(),
            thought: bookThought.value.trim(),
          }
        : undefined,
    photos: draftPhotos,
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

listReviewButton.addEventListener("click", openMonthlyReview);
calendarReviewButton.addEventListener("click", openMonthlyReview);
closeReviewButton.addEventListener("click", closeMonthlyReview);
prevReviewButton.addEventListener("click", () => {
  stopReviewPlayback();
  moveReviewSlide(-1);
});
nextReviewButton.addEventListener("click", () => {
  stopReviewPlayback();
  moveReviewSlide(1);
});
playReviewButton.addEventListener("click", toggleReviewPlayback);

composeButton.addEventListener("click", () => openEditor(null, { blank: true }));

closeEditorButton.addEventListener("click", closeEditor);

modeMenuButton.addEventListener("click", () => {
  toggleModeMenu();
});

modeMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mode]");
  if (!button) return;
  setEntryMode(button.dataset.mode);
  toggleModeMenu(false);
});

addPhotoButton.addEventListener("click", () => {
  photoInput.removeAttribute("capture");
  photoInput.click();
});

addPhotoTileButton.addEventListener("click", () => {
  photoInput.removeAttribute("capture");
  photoInput.click();
});

takePhotoButton.addEventListener("click", () => {
  photoInput.setAttribute("capture", "environment");
  photoInput.click();
});

photoInput.addEventListener("change", () => {
  handlePhotoFiles(photoInput.files);
});

diaryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveEntry();
});

deleteEntryButton.addEventListener("click", () => {
  if (!editingId) return;
  const targetEntry = loadEntries().find((entry) => entry.id === editingId);
  const title = targetEntry ? getEntryTitle(targetEntry) : "この日記";
  if (!confirm(`「${title}」を削除しますか？`)) return;
  saveEntries(loadEntries().filter((entry) => entry.id !== editingId));
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

defaultModeSetting.addEventListener("change", () => {
  settings.defaultMode = defaultModeSetting.value;
  saveSettings();
  renderSettings();
});

reminderSetting.addEventListener("change", () => {
  settings.reminder = reminderSetting.checked;
  saveSettings();
});

passcodeSetting.addEventListener("change", () => {
  settings.passcode = passcodeSetting.checked;
  saveSettings();
});

themeColorRow.addEventListener("click", () => {
  toggleSettingPanel("theme");
});

textSettingRow.addEventListener("click", () => {
  toggleSettingPanel("text");
});

fontStyleRow.addEventListener("click", () => {
  toggleSettingPanel("font");
});

themeColorOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme]");
  if (!button) return;
  settings.themeColor = button.dataset.theme;
  saveSettings();
  render();
});

textSettingOptions.addEventListener("click", (event) => {
  const textSizeButton = event.target.closest("[data-text-size]");
  const lineHeightButton = event.target.closest("[data-line-height]");
  if (!textSizeButton && !lineHeightButton) return;

  if (textSizeButton) settings.textSize = textSizeButton.dataset.textSize;
  if (lineHeightButton) settings.lineHeight = lineHeightButton.dataset.lineHeight;
  saveSettings();
  render();
});

fontStyleOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-font]");
  if (!button) return;
  settings.fontStyle = button.dataset.font;
  saveSettings();
  render();
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

if (new URLSearchParams(location.search).has("write")) {
  openEditor(null, { blank: true });
}
