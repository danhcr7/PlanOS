import { saveDataToCloud, loadDataFromCloud } from "./firebase.js";

/* =========================================================
   PlanOS — app.js 2026 Optimized
   Vanilla JS SPA-style architecture

   Goals:
   - Keep compatible with current index.html / style.css / firebase.js
   - Reduce unnecessary re-render logic
   - Centralize state mutation
   - Add derived analytics cache
   - Safer cloud/local/import flow
   - Event delegation instead of many inline-heavy listeners where possible
   - Better keyboard-first UX
   - More modern dashboard intelligence
========================================================= */

const CONFIG = Object.freeze({
  loginUsername: "danhcr6sdd",
  loginPassword: "thanhdanh7777",
  dailySaving: 15000,
  heatmapDays: 60,
  maxActivityLog: 100,
  saveDelay: 600,
  searchDelay: 160,
  loadingDuration: 1600,
  storage: {
    data: "planosData",
    login: "planosLoggedIn",
    theme: "planosTheme",
    lang: "planosLang",
  },
});

const GROUPS = Object.freeze(["kh1", "kh2", "kh3", "kh4", "kh5", "kh6"]);

const STATUS = Object.freeze({
  todo: "Todo",
  doing: "Doing",
  important: "Quan trọng",
  done: "Xong",
});

const DEFAULT_DATA = Object.freeze({
  kh1: [],
  kh2: [],
  kh3: [],
  kh4: [],
  kh5: [],
  kh6: [],
  kh2Daily: {},
  activityLog: [],
});

const i18n = {
  vi: {
    dashboard: "Tổng quan kế hoạch",
    kh1: "KH1 Học tập",
    kh2: "KH2 Tiết kiệm",
    kh3: "KH3 Dự phòng",
    kh4: "KH4 Sách",
    kh5: "KH5 Laptop",
    kh6: "KH6 MoMo",
    calendar: "Calendar",
    kanban: "Kanban",
    insights: "Insights",
    settings: "Công cụ",

    kh1Desc: "Môn học, deadline, đồ án, bài tập.",
    kh2Desc: "Theo dõi PASS, rút quỹ, ghi chú từng ngày.",
    kh3Desc: "Không gian mở cho mục tiêu mới.",
    kh4Desc: "Sách muốn mua, đang đọc, đã đọc.",
    kh5Desc: "Theo dõi kỳ góp laptop.",
    kh6Desc: "Theo dõi các kỳ góp MoMo.",

    search: "Tìm KH, ghi chú, deadline...",
    add: "+ Thêm",
    addPlan: "+ Thêm kế hoạch",
    save: "☁ Save",
    load: "🔄 Load",
    logout: "🚪 Logout",
    todayStatus: "Trạng thái hôm nay",

    heroTitle: "PlanOS Control Center ✨",
    heroDesc:
      "Hệ điều hành cá nhân cho kế hoạch, deadline, tài chính, thói quen và dữ liệu phát triển bản thân.",

    totalItems: "📦 Tổng item",
    totalSystem: "Toàn hệ thống",
    completed: "✅ Đã xong",
    completedDesc: "Mục hoàn thành",
    important: "🔥 Quan trọng",
    importantDesc: "Cần ưu tiên",
    kh2Balance: "💰 KH2 Số dư",
    balanceDesc: "Đã thêm - đã rút",
    assistant: "🤖 PlanOS Assistant",
    dueTitle: "🔔 Gần hạn / cần chú ý",
    noDue: "Không có mục gần hạn trong 3 ngày tới.",
    recentPlans: "Tất cả kế hoạch gần đây",
    recentPlansDesc: "Dữ liệu từ KH1 đến KH6.",
    emptyPlans: "Chưa có dữ liệu. Bấm + Thêm để bắt đầu.",

    todayFocus: "🎯 Today Focus",
    todayFocusDesc: "Những việc nên xử lý trong ngày hôm nay.",
    noTodayFocus: "Hôm nay khá sạch. Không có mục gấp.",
    lifeScore: "⚡ PlanOS Score",
    lifeScoreDesc: "Điểm tổng hợp từ tiến độ, deadline, tài chính và consistency.",
    systemHealth: "System Health",
    overdueItems: "Quá hạn",
    kh2Today: "KH2 hôm nay",
    passedToday: "Đã PASS",
    notPassedToday: "Chưa PASS",
    currentStreak: "Streak hiện tại",
    bestStreak: "Best streak",
    passRate: "Tỉ lệ PASS 60 ngày",
    weeklyReview: "📈 Weekly Review",
    weeklyReviewDesc: "Tóm tắt nhanh 7 ngày gần nhất.",
    completedThisWeek: "Hoàn thành tuần này",
    addedThisWeek: "Thêm mới tuần này",
    savedThisWeek: "KH2 PASS tuần này",
    productivityPulse: "Productivity Pulse",
    priorityLoad: "Priority Load",
    consistency: "Consistency",

    listTitle: "Danh sách",
    crudDesc: "Có đủ 3 chức năng: thêm, sửa, xóa.",
    emptyInGroup: "Chưa có mục nào trong",
    addTo: "+ Thêm vào",

    passDays: "Tổng ngày PASS",
    passDaysDesc: "Ngày đã thêm 15K",
    totalSaved: "Tổng đã thêm",
    totalSavedDesc: "PASS × 15.000đ",
    totalWithdraw: "Tổng đã rút",
    totalWithdrawDesc: "Tiền lấy từ quỹ",
    fundBalance: "Số dư quỹ",

    chooseDate: "Chọn ngày để cập nhật",
    dateToEdit: "Ngày cần xem / sửa",
    added15k: "Đã thêm 15.000đ vào quỹ",
    tickPass: "Tick nếu ngày này đã PASS.",
    withdrawAmount: "Số tiền rút từ quỹ",
    note: "Ghi chú",
    deleteThisDay: "Xóa ngày này",
    saveThisDay: "Lưu ngày này",
    selectedDayStatus: "Tình trạng ngày đang chọn",
    day: "Ngày",
    added15kQuestion: "Đã thêm 15K?",
    withdrawn: "Đã rút",
    noNote: "Không có",
    heatmap: "🔥 Heatmap 60 ngày gần nhất",
    kh2PrivateNotes: "Ghi chú / kế hoạch riêng của KH2",
    kh2PrivateDesc: "Phần này cũng có thêm, sửa, xóa như các KH khác.",
    addKh2: "+ Thêm KH2",
    kh2Empty: "Chưa có ghi chú riêng trong KH2.",
    history: "Lịch sử ngày đã ghi",
    noHistory: "Chưa có ngày nào được ghi.",
    pass: "PASS",
    notPass: "Chưa PASS",

    calendarDesc: "Xem tất cả deadline, lịch góp, lịch học theo ngày.",
    noDateItems: "Chưa có mục nào có ngày.",
    kanbanDesc: "Chuyển trạng thái nhanh giữa Todo, Doing, Quan trọng và Done.",
    empty: "Trống.",
    insightsDesc: "Thống kê nhanh, achievement và lịch sử hoạt động.",
    groupDistribution: "📦 Phân bố theo KH",
    activityLog: "🧾 Activity Log",
    noActivity: "Chưa có lịch sử hoạt động.",

    toolsDesc: "Backup, import/export JSON, thông báo và đồng bộ Firebase.",
    exportData: "📤 Export dữ liệu",
    exportDesc: "Tải toàn bộ dữ liệu PlanOS thành file JSON để backup.",
    importData: "📥 Import dữ liệu",
    importDesc: "Nhập lại file JSON đã backup.",
    browserNotification: "🔔 Browser Notification",
    notificationDesc: "Bật thông báo deadline và cảnh báo KH2.",
    enableNotification: "Bật thông báo",
    firebaseDesc: "Lưu/tải thủ công nếu muốn kiểm tra cloud.",

    group: "Nhóm KH",
    title: "Tiêu đề",
    dateDeadline: "Ngày / deadline",
    status: "Trạng thái",
    cancel: "Hủy",
    formSave: "Lưu",
    modalNew: "New item",
    modalEdit: "Edit item",
    modalAddTitle: "Thêm kế hoạch",
    modalEditTitle: "Sửa kế hoạch",

    edit: "Sửa",
    delete: "Xóa",
    overdue: "Quá hạn",
    left: "Còn",
    days: "ngày",
    noDate: "Không có ngày",

    cloudSaving: "Đang lưu cloud...",
    cloudSaved: "Đã lưu cloud ☁️",
    cloudLoaded: "Đã tải cloud 🔄",
    cloudEmpty: "Cloud chưa có dữ liệu 😭",
    cloudError: "Lỗi cloud 😭",
    localSaved: "Đã lưu local",
    loginSuccess: "Đăng nhập thành công 🔐",
    importError: "File import không hợp lệ 😭",
    importSuccess: "Import dữ liệu thành công ✅",
    notificationEnabled: "Đã bật thông báo 🔔",
    copiedBackup: "Đã chuẩn bị backup ✅",
    commandHint: "Ctrl+K để tìm kiếm nhanh • Ctrl+N để thêm mới",
  },

  en: {
    dashboard: "Plan Overview",
    kh1: "KH1 Study",
    kh2: "KH2 Saving",
    kh3: "KH3 Backup",
    kh4: "KH4 Books",
    kh5: "KH5 Laptop",
    kh6: "KH6 MoMo",
    calendar: "Calendar",
    kanban: "Kanban",
    insights: "Insights",
    settings: "Tools",

    kh1Desc: "Subjects, deadlines, projects and assignments.",
    kh2Desc: "Track PASS days, withdrawals and daily notes.",
    kh3Desc: "Open space for future goals.",
    kh4Desc: "Books to buy, reading status and wishlist.",
    kh5Desc: "Track laptop installment progress.",
    kh6Desc: "Track MoMo installment payments.",

    search: "Search plans, notes, deadlines...",
    add: "+ Add",
    addPlan: "+ Add Plan",
    save: "☁ Save",
    load: "🔄 Load",
    logout: "🚪 Logout",
    todayStatus: "Today status",

    heroTitle: "PlanOS Control Center ✨",
    heroDesc:
      "A personal operating system for plans, deadlines, finance, habits and self-development data.",

    totalItems: "📦 Total Items",
    totalSystem: "Entire system",
    completed: "✅ Completed",
    completedDesc: "Finished items",
    important: "🔥 Important",
    importantDesc: "Need attention",
    kh2Balance: "💰 KH2 Balance",
    balanceDesc: "Saved - withdrawn",
    assistant: "🤖 PlanOS Assistant",
    dueTitle: "🔔 Due / Attention",
    noDue: "No urgent items in the next 3 days.",
    recentPlans: "Recent Plans",
    recentPlansDesc: "Data from KH1 to KH6.",
    emptyPlans: "No data yet. Click + Add to start.",

    todayFocus: "🎯 Today Focus",
    todayFocusDesc: "Things that deserve attention today.",
    noTodayFocus: "Today is clean. No urgent items.",
    lifeScore: "⚡ PlanOS Score",
    lifeScoreDesc: "Combined score from progress, deadlines, finance and consistency.",
    systemHealth: "System Health",
    overdueItems: "Overdue",
    kh2Today: "KH2 today",
    passedToday: "Passed",
    notPassedToday: "Not passed",
    currentStreak: "Current streak",
    bestStreak: "Best streak",
    passRate: "60-day PASS rate",
    weeklyReview: "📈 Weekly Review",
    weeklyReviewDesc: "Quick summary from the last 7 days.",
    completedThisWeek: "Completed this week",
    addedThisWeek: "Added this week",
    savedThisWeek: "KH2 PASS this week",
    productivityPulse: "Productivity Pulse",
    priorityLoad: "Priority Load",
    consistency: "Consistency",

    listTitle: "List",
    crudDesc: "Includes add, edit and delete.",
    emptyInGroup: "No items in",
    addTo: "+ Add to",

    passDays: "PASS Days",
    passDaysDesc: "Days with 15K added",
    totalSaved: "Total Saved",
    totalSavedDesc: "PASS × 15,000đ",
    totalWithdraw: "Total Withdrawn",
    totalWithdrawDesc: "Money taken from fund",
    fundBalance: "Fund Balance",

    chooseDate: "Choose a date to update",
    dateToEdit: "Date to view / edit",
    added15k: "Added 15,000đ to fund",
    tickPass: "Tick if this day has passed.",
    withdrawAmount: "Withdrawal amount",
    note: "Note",
    deleteThisDay: "Delete this day",
    saveThisDay: "Save this day",
    selectedDayStatus: "Selected day status",
    day: "Date",
    added15kQuestion: "Added 15K?",
    withdrawn: "Withdrawn",
    noNote: "No note",
    heatmap: "🔥 Last 60 Days Heatmap",
    kh2PrivateNotes: "Private KH2 Notes / Plans",
    kh2PrivateDesc: "This section also supports add, edit and delete.",
    addKh2: "+ Add KH2",
    kh2Empty: "No private KH2 notes yet.",
    history: "Recorded History",
    noHistory: "No recorded days yet.",
    pass: "PASS",
    notPass: "Not PASS",

    calendarDesc: "View all deadlines, installment dates and study plans by date.",
    noDateItems: "No dated items yet.",
    kanbanDesc: "Quickly move items between Todo, Doing, Important and Done.",
    empty: "Empty.",
    insightsDesc: "Quick stats, achievements and activity history.",
    groupDistribution: "📦 Group Distribution",
    activityLog: "🧾 Activity Log",
    noActivity: "No activity yet.",

    toolsDesc: "Backup, JSON import/export, notifications and Firebase sync.",
    exportData: "📤 Export Data",
    exportDesc: "Download all PlanOS data as a JSON backup.",
    importData: "📥 Import Data",
    importDesc: "Import a previous JSON backup.",
    browserNotification: "🔔 Browser Notification",
    notificationDesc: "Enable deadline and KH2 alerts.",
    enableNotification: "Enable Notifications",
    firebaseDesc: "Manually save/load cloud data if needed.",

    group: "Group",
    title: "Title",
    dateDeadline: "Date / deadline",
    status: "Status",
    cancel: "Cancel",
    formSave: "Save",
    modalNew: "New item",
    modalEdit: "Edit item",
    modalAddTitle: "Add Plan",
    modalEditTitle: "Edit Plan",

    edit: "Edit",
    delete: "Delete",
    overdue: "Overdue",
    left: "Left",
    days: "days",
    noDate: "No date",

    cloudSaving: "Saving to cloud...",
    cloudSaved: "Cloud saved ☁️",
    cloudLoaded: "Cloud loaded 🔄",
    cloudEmpty: "No cloud data yet 😭",
    cloudError: "Cloud error 😭",
    localSaved: "Local saved",
    loginSuccess: "Login successful 🔐",
    importError: "Invalid import file 😭",
    importSuccess: "Import successful ✅",
    notificationEnabled: "Notifications enabled 🔔",
    copiedBackup: "Backup ready ✅",
    commandHint: "Ctrl+K for quick search • Ctrl+N to add new",
  },
};

const pageInfo = Object.freeze({
  dashboard: { icon: "🏠" },
  kh1: { icon: "📚", desc: "kh1Desc" },
  kh2: { icon: "💰", desc: "kh2Desc" },
  kh3: { icon: "🧩", desc: "kh3Desc" },
  kh4: { icon: "📖", desc: "kh4Desc" },
  kh5: { icon: "💻", desc: "kh5Desc" },
  kh6: { icon: "💳", desc: "kh6Desc" },
  calendar: { icon: "📅", desc: "calendarDesc" },
  kanban: { icon: "🧲", desc: "kanbanDesc" },
  insights: { icon: "📊", desc: "insightsDesc" },
  settings: { icon: "⚙️", desc: "toolsDesc" },
});

const $ = (id) => document.getElementById(id);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const dom = {
  content: $("content"),
  pageTitle: $("pageTitle"),
  navItems: $$(".nav-item"),
  themeBtn: $("themeBtn"),
  addPlanBtn: $("addPlanBtn"),
  cloudSaveBtn: $("cloudSaveBtn"),
  cloudLoadBtn: $("cloudLoadBtn"),
  notifyBtn: $("notifyBtn"),
  globalSearch: $("globalSearch"),
  importFileInput: $("importFileInput"),
  planModal: $("planModal"),
  modalMode: $("modalMode"),
  modalTitle: $("modalTitle"),
  closeModalBtn: $("closeModalBtn"),
  cancelModalBtn: $("cancelModalBtn"),
  planForm: $("planForm"),
  editId: $("editId"),
  planType: $("planType"),
  planName: $("planName"),
  planDate: $("planDate"),
  planStatus: $("planStatus"),
  planNote: $("planNote"),
  toast: $("toast"),
  loginScreen: $("loginScreen"),
  loginForm: $("loginForm"),
  loginUsername: $("loginUsername"),
  loginPassword: $("loginPassword"),
  loginError: $("loginError"),
  logoutBtn: $("logoutBtn"),
  langBtn: $("langBtn"),
  app: $("app"),
  loadingScreen: $("loadingScreen"),
};

const runtime = {
  currentPage: "dashboard",
  currentLang: localStorage.getItem(CONFIG.storage.lang) || "vi",
  searchQuery: "",
  saveTimer: null,
  searchTimer: null,
  toastTimer: null,
  clockTimer: null,
  isCloudSaving: false,
  pendingCloudSave: false,
  lastSaveAt: 0,
  analyticsCache: null,
  analyticsCacheVersion: -1,
};

const store = {
  data: loadLocal(),
  version: 0,
};

/* =========================================================
   CORE UTILITIES
========================================================= */

function t(key) {
  return i18n[runtime.currentLang]?.[key] || i18n.vi[key] || key;
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

function uid() {
  return (
    crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

function escapeHTML(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(text = "") {
  return escapeHTML(text).replaceAll("`", "&#096;");
}

function formatMoney(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function today() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(dateString, amount) {
  const d = new Date(`${dateString}T00:00:00`);
  d.setDate(d.getDate() + amount);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return t("noDate");
  const [y, m, d] = String(dateString).split("-");
  if (!y || !m || !d) return dateString;
  return `${d}/${m}/${y}`;
}

function daysBetween(dateString) {
  if (!dateString) return null;
  const now = new Date(`${today()}T00:00:00`);
  const target = new Date(`${dateString}T00:00:00`);
  const diff = Math.ceil((target - now) / 86400000);
  return Number.isFinite(diff) ? diff : null;
}

function isWithinLastDays(isoString, days = 7) {
  if (!isoString) return false;
  const time = new Date(isoString).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= days * 86400000;
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function nextFrame(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

function statusLabel(status) {
  if (runtime.currentLang === "en" && status === STATUS.important) return "Important";
  if (runtime.currentLang === "en" && status === STATUS.done) return "Done";
  return status || STATUS.todo;
}

function badgeClass(status) {
  if (status === STATUS.done) return "green";
  if (status === STATUS.important) return "red";
  if (status === STATUS.doing) return "yellow";
  return "blue";
}

function setButtonBusy(button, isBusy, labelWhenBusy) {
  if (!button) return;

  if (isBusy) {
    button.dataset.oldText = button.textContent;
    button.textContent = labelWhenBusy;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.style.opacity = "0.72";
    return;
  }

  button.textContent = button.dataset.oldText || button.textContent;
  button.disabled = false;
  button.removeAttribute("aria-busy");
  button.style.opacity = "";
}

function showToast(message) {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  clearTimeout(runtime.toastTimer);
  runtime.toastTimer = setTimeout(() => dom.toast.classList.remove("show"), 1900);
}

function setContent(html) {
  if (!dom.content) return;
  dom.content.setAttribute("aria-busy", "true");
  dom.content.innerHTML = html;
  nextFrame(() => dom.content?.removeAttribute("aria-busy"));
}

/* =========================================================
   DATA NORMALIZATION / STORE
========================================================= */

function normalizeItem(item = {}) {
  const now = new Date().toISOString();

  return {
    id: item.id || uid(),
    name: String(item.name || item.title || "").trim(),
    date: item.date || "",
    status: item.status || STATUS.todo,
    note: item.note || "",
    createdAt: item.createdAt || item.updatedAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeKh2Record(record = {}) {
  return {
    saved: Boolean(record.saved),
    withdraw: Math.max(0, Number(record.withdraw || 0)),
    note: record.note || "",
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

function normalizeData(raw = {}) {
  const safe = { ...DEFAULT_DATA, ...(raw || {}) };
  const normalized = {
    kh1: [],
    kh2: [],
    kh3: [],
    kh4: [],
    kh5: [],
    kh6: [],
    kh2Daily: {},
    activityLog: Array.isArray(safe.activityLog) ? safe.activityLog : [],
  };

  GROUPS.forEach((key) => {
    normalized[key] = Array.isArray(safe[key])
      ? safe[key].map(normalizeItem).filter((item) => item.name)
      : [];
  });

  normalized.kh2Daily = Object.fromEntries(
    Object.entries(safe.kh2Daily || safe.kh2Data || {}).map(([date, record]) => [
      date,
      normalizeKh2Record(record),
    ]),
  );

  normalized.activityLog = normalized.activityLog
    .filter((log) => log && log.action)
    .map((log) => ({
      id: log.id || uid(),
      action: log.action,
      detail: log.detail || "",
      at: log.at || new Date().toISOString(),
    }))
    .slice(0, CONFIG.maxActivityLog);

  return normalized;
}

function loadLocal() {
  try {
    return normalizeData(JSON.parse(localStorage.getItem(CONFIG.storage.data)) || {});
  } catch (error) {
    console.warn("PlanOS local data parse error:", error);
    return normalizeData();
  }
}

function saveLocal() {
  localStorage.setItem(CONFIG.storage.data, JSON.stringify(store.data));
}

function invalidateAnalytics() {
  store.version += 1;
  runtime.analyticsCache = null;
}

function commit(mutator, options = {}) {
  const { activity, render = true, cloud = true, toast = "" } = options;
  mutator(store.data);

  if (activity) addActivity(activity.action, activity.detail, false);

  invalidateAnalytics();
  saveLocal();

  if (cloud) scheduleCloudSave();
  if (render) loadPage(runtime.currentPage);
  if (toast) showToast(toast);
}

function addActivity(action, detail, bump = true) {
  store.data.activityLog.unshift({
    id: uid(),
    action,
    detail,
    at: new Date().toISOString(),
  });

  store.data.activityLog = store.data.activityLog.slice(0, CONFIG.maxActivityLog);
  if (bump) invalidateAnalytics();
}

/* =========================================================
   CLOUD SYNC
========================================================= */

function scheduleCloudSave() {
  clearTimeout(runtime.saveTimer);
  runtime.saveTimer = setTimeout(() => saveCloud(false), CONFIG.saveDelay);
}

async function saveCloud(showMessage = false) {
  if (runtime.isCloudSaving) {
    runtime.pendingCloudSave = true;
    return;
  }

  runtime.isCloudSaving = true;
  runtime.pendingCloudSave = false;

  if (showMessage) setButtonBusy(dom.cloudSaveBtn, true, t("cloudSaving"));

  try {
    const payload = {
      ...store.data,
      savedAt: new Date().toISOString(),
      version: Date.now(),
    };

    await saveDataToCloud(payload);
    runtime.lastSaveAt = Date.now();

    if (showMessage) showToast(t("cloudSaved"));
  } catch (error) {
    console.error("Firebase save error:", error);
    runtime.pendingCloudSave = true;
    if (showMessage) showToast(t("cloudError"));
  } finally {
    runtime.isCloudSaving = false;
    if (showMessage) setButtonBusy(dom.cloudSaveBtn, false);

    if (runtime.pendingCloudSave) {
      runtime.pendingCloudSave = false;
      setTimeout(() => saveCloud(false), 300);
    }
  }
}

async function loadCloud(showMessage = false) {
  if (showMessage) {
    setButtonBusy(dom.cloudLoadBtn, true, runtime.currentLang === "vi" ? "Đang tải..." : "Loading...");
  }

  try {
    const data = await loadDataFromCloud();

    if (!data) {
      if (showMessage) showToast(t("cloudEmpty"));
      return false;
    }

    store.data = normalizeData(data);
    invalidateAnalytics();
    saveLocal();
    loadPage(runtime.currentPage);

    if (showMessage) showToast(t("cloudLoaded"));
    return true;
  } catch (error) {
    console.error("Firebase load error:", error);
    if (showMessage) showToast(t("cloudError"));
    return false;
  } finally {
    if (showMessage) setButtonBusy(dom.cloudLoadBtn, false);
  }
}

/* =========================================================
   DERIVED DATA / ANALYTICS CACHE
========================================================= */

function getAllItems() {
  return GROUPS.flatMap((key) => store.data[key].map((item) => ({ ...item, group: key })));
}

function getFilteredItems(items) {
  const q = runtime.searchQuery.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) =>
    [item.name, item.note, item.status, item.date, item.group, t(item.group)]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

function getAnalytics() {
  if (runtime.analyticsCache && runtime.analyticsCacheVersion === store.version) {
    return runtime.analyticsCache;
  }

  const all = getAllItems();
  const done = all.filter((i) => i.status === STATUS.done).length;
  const important = all.filter((i) => i.status === STATUS.important).length;
  const overdue = all.filter((i) => i.status !== STATUS.done && i.date && daysBetween(i.date) < 0).length;
  const dueSoon = all
    .filter((item) => item.status !== STATUS.done && item.date)
    .map((item) => ({ ...item, daysLeft: daysBetween(item.date) }))
    .filter((item) => item.daysLeft !== null && item.daysLeft <= 3)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const kh2 = getKh2Stats();
  const weekly = getWeeklyStats(all);
  const life = getLifeScore(all, kh2, { done, important, overdue });

  runtime.analyticsCache = {
    all,
    done,
    important,
    overdue,
    dueSoon,
    kh2,
    weekly,
    life,
    todayFocus: getTodayFocusItems(all),
  };
  runtime.analyticsCacheVersion = store.version;
  return runtime.analyticsCache;
}

function getDueItems(maxDays = 3) {
  return getAllItems()
    .filter((item) => item.status !== STATUS.done && item.date)
    .map((item) => ({ ...item, daysLeft: daysBetween(item.date) }))
    .filter((item) => item.daysLeft !== null && item.daysLeft <= maxDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function getTodayFocusItems(items = getAllItems()) {
  return items
    .filter((item) => item.status !== STATUS.done)
    .map((item) => ({ ...item, daysLeft: item.date ? daysBetween(item.date) : null }))
    .filter(
      (item) =>
        item.status === STATUS.important ||
        (item.daysLeft !== null && item.daysLeft <= 1),
    )
    .sort((a, b) => focusScore(a) - focusScore(b))
    .slice(0, 6);
}

function focusScore(item) {
  if (item.daysLeft !== null && item.daysLeft < 0) return -100 + item.daysLeft;
  if (item.daysLeft === 0) return -70;
  if (item.status === STATUS.important) return -40;
  if (item.daysLeft === 1) return -20;
  return 10;
}

function getKh2Stats() {
  const records = Object.values(store.data.kh2Daily || {});
  const passDays = records.filter((d) => d.saved).length;
  const totalSaved = passDays * CONFIG.dailySaving;
  const totalWithdraw = records.reduce((sum, d) => sum + Number(d.withdraw || 0), 0);
  const streaks = getKh2Streaks();
  const passRate60 = getKh2PassRate(CONFIG.heatmapDays);

  return {
    passDays,
    totalSaved,
    totalWithdraw,
    balance: totalSaved - totalWithdraw,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    passRate60,
  };
}

function getKh2Streaks() {
  const records = store.data.kh2Daily || {};
  let current = 0;
  let best = 0;
  let running = 0;

  for (let i = CONFIG.heatmapDays - 1; i >= 0; i--) {
    const date = addDays(today(), -i);
    if (records[date]?.saved) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  for (let i = 0; i < CONFIG.heatmapDays; i++) {
    const date = addDays(today(), -i);
    if (records[date]?.saved) current += 1;
    else break;
  }

  return { current, best };
}

function getKh2PassRate(days = CONFIG.heatmapDays) {
  let pass = 0;

  for (let i = 0; i < days; i++) {
    const date = addDays(today(), -i);
    if (store.data.kh2Daily?.[date]?.saved) pass += 1;
  }

  return Math.round((pass / days) * 100);
}

function getWeeklyStats(all = getAllItems()) {
  const completedThisWeek = all.filter(
    (item) => item.status === STATUS.done && isWithinLastDays(item.updatedAt, 7),
  ).length;
  const addedThisWeek = all.filter((item) => isWithinLastDays(item.createdAt, 7)).length;

  let savedThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(today(), -i);
    if (store.data.kh2Daily?.[date]?.saved) savedThisWeek += 1;
  }

  return { completedThisWeek, addedThisWeek, savedThisWeek };
}

function getLifeScore(all = getAllItems(), kh2 = getKh2Stats(), counts = {}) {
  const total = all.length;
  const done = counts.done ?? all.filter((i) => i.status === STATUS.done).length;
  const overdue = counts.overdue ?? all.filter((i) => i.status !== STATUS.done && i.date && daysBetween(i.date) < 0).length;
  const important = counts.important ?? all.filter((i) => i.status === STATUS.important).length;

  const completionScore = total ? (done / total) * 35 : 18;
  const deadlineScore = clamp(30 - overdue * 7, 0, 30);
  const financeScore = kh2.balance >= 0 ? 20 : clamp(20 + kh2.balance / 50000, 0, 20);
  const consistencyScore = clamp(kh2.passRate60 / 100, 0, 1) * 15;
  const penalty = Math.min(important * 1.5, 8);

  const score = Math.round(
    clamp(completionScore + deadlineScore + financeScore + consistencyScore - penalty, 0, 100),
  );

  let label = runtime.currentLang === "vi" ? "Ổn định" : "Stable";
  if (score >= 85) label = runtime.currentLang === "vi" ? "Rất tốt" : "Excellent";
  else if (score >= 70) label = runtime.currentLang === "vi" ? "Ổn định" : "Stable";
  else if (score >= 50) label = runtime.currentLang === "vi" ? "Cần chú ý" : "Needs attention";
  else label = runtime.currentLang === "vi" ? "Cần xử lý" : "Critical";

  return { score, label, overdue, important };
}

function getAssistantAdvice() {
  const { kh2, dueSoon, life } = getAnalytics();
  const todayKh2 = Boolean(store.data.kh2Daily?.[today()]?.saved);

  if (runtime.currentLang === "en") {
    const arr = [
      `PlanOS Score is ${life.score}/100 — ${life.label}.`,
      kh2.balance < 0
        ? `KH2 is negative by ${formatMoney(Math.abs(kh2.balance))}. Prioritize refunding the fund.`
        : `KH2 is positive by ${formatMoney(kh2.balance)}. Financial status looks stable.`,
    ];
    if (!todayKh2) arr.push("KH2 has not passed today yet.");
    if (dueSoon.length) arr.push(`${dueSoon.length} items are due soon.`);
    if (kh2.currentStreak) arr.push(`Current KH2 streak: ${kh2.currentStreak} days.`);
    return arr;
  }

  const arr = [
    `PlanOS Score hiện tại là ${life.score}/100 — ${life.label}.`,
    kh2.balance < 0
      ? `KH2 đang âm ${formatMoney(Math.abs(kh2.balance))}, nên ưu tiên bù quỹ.`
      : `KH2 đang dương ${formatMoney(kh2.balance)}, tình hình tài chính ổn.`,
  ];
  if (!todayKh2) arr.push("KH2 hôm nay chưa PASS, nên cập nhật trước khi kết thúc ngày.");
  if (dueSoon.length) arr.push(`Có ${dueSoon.length} mục gần hạn, nên xử lý trước.`);
  if (kh2.currentStreak) arr.push(`Bạn đang giữ streak KH2 ${kh2.currentStreak} ngày.`);
  return arr;
}

/* =========================================================
   LANGUAGE / THEME
========================================================= */

function applyLanguage() {
  if (dom.globalSearch) dom.globalSearch.placeholder = t("search");
  if (dom.addPlanBtn) dom.addPlanBtn.textContent = t("add");
  if (dom.cloudSaveBtn && !runtime.isCloudSaving) dom.cloudSaveBtn.textContent = t("save");
  if (dom.cloudLoadBtn) dom.cloudLoadBtn.textContent = t("load");
  if (dom.logoutBtn) dom.logoutBtn.textContent = t("logout");
  if (dom.langBtn) dom.langBtn.textContent = runtime.currentLang.toUpperCase();
  if (dom.pageTitle) dom.pageTitle.textContent = t(runtime.currentPage);
  if (dom.cancelModalBtn) dom.cancelModalBtn.textContent = t("cancel");
  if ($("modalSaveBtn")) $("modalSaveBtn").textContent = t("formSave");

  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const old = el.textContent.trim();
    const icon = old.match(/^[^\p{L}\p{N}]+/u)?.[0]?.trim();
    el.textContent = icon ? `${icon} ${t(key)}` : t(key);
  });
}

function applyThemeFromStorage() {
  const saved = localStorage.getItem(CONFIG.storage.theme);
  document.body.classList.toggle("light", saved === "light");
  if (dom.themeBtn) dom.themeBtn.textContent = saved === "light" ? "☀️" : "🌙";
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem(CONFIG.storage.theme, isLight ? "light" : "dark");
  if (dom.themeBtn) dom.themeBtn.textContent = isLight ? "☀️" : "🌙";
}

/* =========================================================
   AUTH
========================================================= */

function checkLogin() {
  const ok = sessionStorage.getItem(CONFIG.storage.login) === "true";

  dom.loginScreen?.classList.toggle("hide", ok);
  dom.app?.classList.toggle("hide", !ok);
  dom.loadingScreen?.classList.remove("show");

  return ok;
}

function handleLogin(event) {
  event.preventDefault();

  const username = dom.loginUsername?.value.trim();
  const password = dom.loginPassword?.value.trim();

  if (username === CONFIG.loginUsername && password === CONFIG.loginPassword) {
    sessionStorage.setItem(CONFIG.storage.login, "true");
    dom.loginError?.classList.remove("show");
    dom.loginScreen?.classList.add("hide");
    dom.app?.classList.add("hide");
    dom.loadingScreen?.classList.add("show");

    setTimeout(() => {
      dom.loadingScreen?.classList.remove("show");
      dom.app?.classList.remove("hide");
      loadPage(runtime.currentPage || "dashboard");
      applyLanguage();
      updateRealTimeClock();
      showToast(t("loginSuccess"));
    }, CONFIG.loadingDuration);

    return;
  }

  dom.loginError?.classList.add("show");
  if (dom.loginPassword) dom.loginPassword.value = "";
}

function logout() {
  sessionStorage.removeItem(CONFIG.storage.login);
  location.reload();
}

/* =========================================================
   RENDER HELPERS
========================================================= */

function statCard(title, value, desc, extraClass = "") {
  return `
    <div class="card ${escapeAttr(extraClass)}">
      <h3>${title}</h3>
      <p class="big">${value}</p>
      <p class="muted">${desc}</p>
    </div>
  `;
}

function renderScoreRing(score) {
  const angle = clamp(score, 0, 100) * 3.6;
  return `
    <div class="score-ring" style="--score-angle: ${angle}deg" aria-label="PlanOS Score ${score} out of 100">
      <div>
        <strong>${score}</strong>
        <span>/100</span>
      </div>
    </div>
  `;
}

function renderMiniMetric(label, value, detail = "") {
  return `
    <div class="mini-note">
      <div>
        <strong>${escapeHTML(label)}</strong>
        ${detail ? `<p class="muted">${escapeHTML(detail)}</p>` : ""}
      </div>
      <strong>${escapeHTML(String(value))}</strong>
    </div>
  `;
}

function renderItem(item) {
  const group = item.group || runtime.currentPage;
  const left = item.date ? daysBetween(item.date) : null;
  const dueText =
    left === null
      ? ""
      : left < 0
        ? ` • ${t("overdue")} ${Math.abs(left)} ${t("days")}`
        : ` • ${t("left")} ${left} ${t("days")}`;

  return `
    <div class="item" data-item-id="${escapeAttr(item.id)}" data-group="${escapeAttr(group)}">
      <div>
        <strong>${escapeHTML(item.name)}</strong>
        <p class="muted">
          ${group.toUpperCase()}
          ${item.date ? "• " + formatDate(item.date) : ""}
          ${dueText}
          ${item.note ? "• " + escapeHTML(item.note) : ""}
        </p>
      </div>

      <div class="item-actions">
        <span class="badge ${badgeClass(item.status)}">${escapeHTML(statusLabel(item.status))}</span>
        <button class="mini-btn" data-action="edit-item" data-group="${escapeAttr(group)}" data-id="${escapeAttr(item.id)}">${t("edit")}</button>
        <button class="mini-btn danger" data-action="delete-item" data-group="${escapeAttr(group)}" data-id="${escapeAttr(item.id)}">${t("delete")}</button>
      </div>
    </div>
  `;
}

/* =========================================================
   PAGES
========================================================= */

function renderDashboard() {
  const analytics = getAnalytics();
  const allItems = getFilteredItems(analytics.all);
  const done = allItems.filter((i) => i.status === STATUS.done).length;
  const important = allItems.filter((i) => i.status === STATUS.important).length;
  const advice = getAssistantAdvice();
  const kh2Today = Boolean(store.data.kh2Daily?.[today()]?.saved);

  setContent(`
    <div class="grid">
      <div class="card hero">
        <p class="eyebrow">${t("commandHint")}</p>
        <h2>${t("heroTitle")}</h2>
        <p>${t("heroDesc")}</p>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="section-head">
            <div>
              <h3>${t("lifeScore")}</h3>
              <p class="muted">${t("lifeScoreDesc")}</p>
            </div>
            ${renderScoreRing(analytics.life.score)}
          </div>
          <div class="list">
            ${renderMiniMetric(t("systemHealth"), analytics.life.label, `${analytics.life.overdue} ${t("overdueItems")} • ${analytics.life.important} ${t("important")}`)}
            ${renderMiniMetric(t("kh2Today"), kh2Today ? t("passedToday") : t("notPassedToday"), `${t("currentStreak")}: ${analytics.kh2.currentStreak} ${t("days")}`)}
          </div>
        </div>

        <div class="card">
          <div class="section-head">
            <div>
              <h3>${t("todayFocus")}</h3>
              <p class="muted">${t("todayFocusDesc")}</p>
            </div>
            <button class="primary-btn" data-action="add-item" data-group="kh1">${t("addPlan")}</button>
          </div>
          <div class="list">
            ${analytics.todayFocus.length ? analytics.todayFocus.map(renderItem).join("") : `<p class="muted">${t("noTodayFocus")}</p>`}
          </div>
        </div>
      </div>

      <div class="grid grid-4">
        ${statCard(t("totalItems"), allItems.length, t("totalSystem"))}
        ${statCard(t("completed"), done, t("completedDesc"))}
        ${statCard(t("important"), important, t("importantDesc"))}
        ${statCard(t("kh2Balance"), formatMoney(analytics.kh2.balance), t("balanceDesc"), analytics.kh2.balance < 0 ? "danger-text" : "success-text")}
      </div>

      <div class="grid grid-4">
        ${statCard(t("currentStreak"), analytics.kh2.currentStreak, "KH2")}
        ${statCard(t("bestStreak"), analytics.kh2.bestStreak, "KH2")}
        ${statCard(t("passRate"), `${analytics.kh2.passRate60}%`, "KH2")}
        ${statCard(t("fundBalance"), formatMoney(analytics.kh2.balance), t("balanceDesc"), analytics.kh2.balance < 0 ? "danger-text" : "success-text")}
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("assistant")}</h3>
          <div class="list">
            ${advice.map((x) => `<div class="mini-note">${escapeHTML(x)}</div>`).join("")}
          </div>
        </div>

        <div class="card">
          <h3>${t("weeklyReview")}</h3>
          <p class="muted">${t("weeklyReviewDesc")}</p>
          <div class="list">
            ${renderMiniMetric(t("completedThisWeek"), analytics.weekly.completedThisWeek)}
            ${renderMiniMetric(t("addedThisWeek"), analytics.weekly.addedThisWeek)}
            ${renderMiniMetric(t("savedThisWeek"), `${analytics.weekly.savedThisWeek}/7`)}
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("dueTitle")}</h3>
          <div class="list">
            ${analytics.dueSoon.length ? analytics.dueSoon.slice(0, 6).map(renderItem).join("") : `<p class="muted">${t("noDue")}</p>`}
          </div>
        </div>

        <div class="card">
          <div class="section-head">
            <div>
              <h3>${t("recentPlans")}</h3>
              <p class="muted">${t("recentPlansDesc")}</p>
            </div>
          </div>
          <div class="list">
            ${allItems.length ? allItems.slice(-8).reverse().map(renderItem).join("") : `<p class="muted">${t("emptyPlans")}</p>`}
          </div>
        </div>
      </div>
    </div>
  `);
}

function renderKhPage(key) {
  if (key === "kh2") return renderKh2();

  const items = getFilteredItems(store.data[key].map((item) => ({ ...item, group: key })));

  setContent(`
    <div class="grid">
      <div class="card hero small-hero">
        <h2>${pageInfo[key].icon} ${t(key)}</h2>
        <p>${t(pageInfo[key].desc)}</p>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>${t("listTitle")} ${t(key)}</h3>
            <p class="muted">${t("crudDesc")}</p>
          </div>
          <button class="primary-btn" data-action="add-item" data-group="${key}">
            ${t("addTo")} ${key.toUpperCase()}
          </button>
        </div>

        <div class="list">
          ${items.length ? items.map(renderItem).join("") : `<p class="muted">${t("emptyInGroup")} ${key.toUpperCase()}.</p>`}
        </div>
      </div>
    </div>
  `);
}

function renderKh2() {
  const { kh2 } = getAnalytics();

  setContent(`
    <div class="grid">
      <div class="card hero small-hero">
        <h2>💰 ${t("kh2")}</h2>
        <p>${t("kh2Desc")}</p>
      </div>

      <div class="grid grid-4">
        ${statCard(t("passDays"), kh2.passDays, t("passDaysDesc"))}
        ${statCard(t("currentStreak"), kh2.currentStreak, "KH2")}
        ${statCard(t("bestStreak"), kh2.bestStreak, "KH2")}
        ${statCard(t("passRate"), `${kh2.passRate60}%`, `Last ${CONFIG.heatmapDays} days`)}
      </div>

      <div class="grid grid-4">
        ${statCard(t("totalSaved"), formatMoney(kh2.totalSaved), t("totalSavedDesc"))}
        ${statCard(t("totalWithdraw"), formatMoney(kh2.totalWithdraw), t("totalWithdrawDesc"))}
        ${statCard(t("fundBalance"), formatMoney(kh2.balance), t("balanceDesc"), kh2.balance < 0 ? "danger-text" : "success-text")}
        ${statCard(t("kh2Today"), store.data.kh2Daily?.[today()]?.saved ? t("passedToday") : t("notPassedToday"), formatDate(today()))}
      </div>

      <div class="grid grid-2">
        <div class="card form-card">
          <h3>${t("chooseDate")}</h3>

          <label>${t("dateToEdit")}<input type="date" id="kh2DateInput" /></label>

          <div class="checkbox-row">
            <input type="checkbox" id="kh2SavedInput" />
            <div><strong>${t("added15k")}</strong><p class="muted">${t("tickPass")}</p></div>
          </div>

          <label>${t("withdrawAmount")}<input type="number" id="kh2WithdrawInput" min="0" step="1000" /></label>
          <label>${t("note")}<textarea id="kh2NoteInput"></textarea></label>

          <div class="modal-actions">
            <button type="button" class="ghost-btn" id="kh2DeleteDayBtn">${t("deleteThisDay")}</button>
            <button type="button" class="primary-btn" id="kh2SaveDayBtn">${t("saveThisDay")}</button>
          </div>
        </div>

        <div class="card">
          <h3>${t("selectedDayStatus")}</h3>
          <div class="kh2-status">
            <div class="status-line"><span>${t("day")}</span><strong id="kh2SelectedDate">--</strong></div>
            <div class="status-line"><span>${t("added15kQuestion")}</span><strong id="kh2SelectedSaved">--</strong></div>
            <div class="status-line"><span>${t("withdrawn")}</span><strong id="kh2SelectedWithdraw">0đ</strong></div>
            <div class="status-line"><span>${t("note")}</span><strong id="kh2SelectedNote">${t("noNote")}</strong></div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>${t("heatmap")}</h3>
        <div class="heatmap">${renderKh2Heatmap()}</div>
      </div>

      <div class="card">
        <div class="section-head">
          <div><h3>${t("kh2PrivateNotes")}</h3><p class="muted">${t("kh2PrivateDesc")}</p></div>
          <button class="primary-btn" data-action="add-item" data-group="kh2">${t("addKh2")}</button>
        </div>
        <div class="list">
          ${store.data.kh2.length ? store.data.kh2.map((i) => renderItem({ ...i, group: "kh2" })).join("") : `<p class="muted">${t("kh2Empty")}</p>`}
        </div>
      </div>

      <div class="card">
        <h3>${t("history")}</h3>
        <div class="list">${renderKh2History()}</div>
      </div>
    </div>
  `);

  initKh2Form();
}

function renderKh2Heatmap() {
  const cells = [];

  for (let i = CONFIG.heatmapDays - 1; i >= 0; i--) {
    const key = addDays(today(), -i);
    const record = store.data.kh2Daily[key];

    let cls = "heat-cell empty-cell";
    if (record?.saved) cls = "heat-cell pass-cell";
    if (record && !record.saved) cls = "heat-cell fail-cell";

    cells.push(`
      <button
        type="button"
        class="${cls}"
        title="${key}"
        aria-label="KH2 ${key}"
        data-action="select-kh2-date"
        data-date="${key}"
      ></button>
    `);
  }

  return cells.join("");
}

function renderKh2History() {
  const entries = Object.entries(store.data.kh2Daily || {}).sort((a, b) => b[0].localeCompare(a[0]));

  if (!entries.length) return `<p class="muted">${t("noHistory")}</p>`;

  return entries
    .map(
      ([date, r]) => `
        <div class="item">
          <div>
            <strong>${escapeHTML(date)}</strong>
            <p class="muted">
              ${t("withdrawn")}: ${formatMoney(r.withdraw || 0)}
              ${r.note ? "• " + escapeHTML(r.note) : ""}
            </p>
          </div>

          <div class="kh2-history-actions">
            <span class="badge ${r.saved ? "green" : "red"}">
              ${r.saved ? t("pass") : t("notPass")}
            </span>

            <button
              type="button"
              class="kh2-history-delete"
              data-action="delete-kh2-day"
              data-date="${escapeAttr(date)}"
              title="${runtime.currentLang === "vi" ? "Xóa ngày này" : "Delete this day"}"
            >
              🗑
            </button>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderCalendar() {
  const items = getFilteredItems(getAnalytics().all)
    .filter((i) => i.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const grouped = items.reduce((acc, item) => {
    acc[item.date] ||= [];
    acc[item.date].push(item);
    return acc;
  }, {});

  setContent(`
    <div class="grid">
      <div class="card hero small-hero"><h2>📅 ${t("calendar")}</h2><p>${t("calendarDesc")}</p></div>
      <div class="card">
        <div class="list">
          ${
            Object.keys(grouped).length
              ? Object.entries(grouped)
                  .map(
                    ([date, list]) => `
                      <div class="timeline-item">
                        <div>
                          <strong>${formatDate(date)}</strong>
                          <p class="muted">${list.length} item</p>
                        </div>
                        <div class="list" style="width:100%; margin-top:0">
                          ${list.map(renderItem).join("")}
                        </div>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="muted">${t("noDateItems")}</p>`
          }
        </div>
      </div>
    </div>
  `);
}

function renderKanban() {
  const items = getFilteredItems(getAnalytics().all);
  const cols = [
    { key: STATUS.todo, title: "Todo" },
    { key: STATUS.doing, title: "Doing" },
    { key: STATUS.important, title: runtime.currentLang === "vi" ? "Quan trọng" : "Important" },
    { key: STATUS.done, title: runtime.currentLang === "vi" ? "Xong" : "Done" },
  ];

  setContent(`
    <div class="grid">
      <div class="card hero small-hero"><h2>🧲 ${t("kanban")}</h2><p>${t("kanbanDesc")}</p></div>
      <div class="kanban">
        ${cols
          .map((col) => {
            const list = items.filter((i) => (i.status || STATUS.todo) === col.key);
            return `
              <div class="kanban-col">
                <h3>${col.title} <span>${list.length}</span></h3>
                <div class="list">
                  ${list.length ? list.map(renderKanbanCard).join("") : `<p class="muted">${t("empty")}</p>`}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `);
}

function renderKanbanCard(item) {
  return `
    <div class="kanban-card">
      <strong>${escapeHTML(item.name)}</strong>
      <p class="muted">${item.group.toUpperCase()} ${item.date ? "• " + formatDate(item.date) : ""}</p>
      <div class="kanban-actions">
        <button class="mini-btn" data-action="move-item" data-group="${escapeAttr(item.group)}" data-id="${escapeAttr(item.id)}" data-status="Todo">Todo</button>
        <button class="mini-btn" data-action="move-item" data-group="${escapeAttr(item.group)}" data-id="${escapeAttr(item.id)}" data-status="Doing">Doing</button>
        <button class="mini-btn" data-action="move-item" data-group="${escapeAttr(item.group)}" data-id="${escapeAttr(item.id)}" data-status="Quan trọng">🔥</button>
        <button class="mini-btn" data-action="move-item" data-group="${escapeAttr(item.group)}" data-id="${escapeAttr(item.id)}" data-status="Xong">✅</button>
      </div>
    </div>
  `;
}

function renderInsights() {
  const { all, kh2, life } = getAnalytics();

  setContent(`
    <div class="grid">
      <div class="card hero small-hero"><h2>📊 ${t("insights")}</h2><p>${t("insightsDesc")}</p></div>

      <div class="grid grid-4">
        ${statCard(t("lifeScore"), `${life.score}/100`, life.label)}
        ${statCard(t("totalItems"), all.length, t("totalSystem"))}
        ${statCard(t("passDays"), kh2.passDays, t("passDaysDesc"))}
        ${statCard(t("fundBalance"), formatMoney(kh2.balance), "KH2", kh2.balance < 0 ? "danger-text" : "success-text")}
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("groupDistribution")}</h3>
          <div class="list">
            ${GROUPS.map((key) => renderMiniMetric(t(key), store.data[key].length, key.toUpperCase())).join("")}
          </div>
        </div>

        <div class="card">
          <h3>${t("activityLog")}</h3>
          <div class="list">
            ${
              store.data.activityLog.length
                ? store.data.activityLog
                    .slice(0, 24)
                    .map(
                      (log) => `
                        <div class="item">
                          <div>
                            <strong>${escapeHTML(log.action)}</strong>
                            <p class="muted">${escapeHTML(log.detail)} • ${new Date(log.at).toLocaleString(runtime.currentLang === "vi" ? "vi-VN" : "en-US")}</p>
                          </div>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="muted">${t("noActivity")}</p>`
            }
          </div>
        </div>
      </div>
    </div>
  `);
}

function renderSettings() {
  setContent(`
    <div class="grid">
      <div class="card hero small-hero"><h2>⚙️ ${t("settings")}</h2><p>${t("toolsDesc")}</p></div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("exportData")}</h3>
          <p class="muted">${t("exportDesc")}</p>
          <button class="primary-btn" data-action="export-data">Export JSON</button>
        </div>
        <div class="card">
          <h3>${t("importData")}</h3>
          <p class="muted">${t("importDesc")}</p>
          <button class="primary-btn" data-action="import-data">Import JSON</button>
        </div>
        <div class="card">
          <h3>${t("browserNotification")}</h3>
          <p class="muted">${t("notificationDesc")}</p>
          <button class="primary-btn" data-action="request-notifications">${t("enableNotification")}</button>
        </div>
        <div class="card">
          <h3>☁ Firebase</h3>
          <p class="muted">${t("firebaseDesc")}</p>
          <div class="tool-row">
            <button class="primary-btn" data-action="manual-save">Save Cloud</button>
            <button class="ghost-btn" data-action="manual-load">Load Cloud</button>
          </div>
        </div>
      </div>
    </div>
  `);
}

/* =========================================================
   KH2 INTERACTION
========================================================= */

function initKh2Form() {
  const dateInput = $("kh2DateInput");
  const savedInput = $("kh2SavedInput");
  const withdrawInput = $("kh2WithdrawInput");
  const noteInput = $("kh2NoteInput");
  const saveBtn = $("kh2SaveDayBtn");
  const deleteBtn = $("kh2DeleteDayBtn");

  if (!dateInput || !savedInput || !withdrawInput || !noteInput || !saveBtn || !deleteBtn) return;

  function renderSelected() {
    const date = dateInput.value;
    const record = store.data.kh2Daily[date] || { saved: false, withdraw: 0, note: "" };

    savedInput.checked = Boolean(record.saved);
    withdrawInput.value = record.withdraw || "";
    noteInput.value = record.note || "";

    $("kh2SelectedDate").textContent = date || "--";

    const selectedSaved = $("kh2SelectedSaved");
    selectedSaved.textContent = record.saved ? `${t("pass")} ✅` : `${t("notPass")} ❌`;
    selectedSaved.className = record.saved ? "success-text" : "danger-text";

    $("kh2SelectedWithdraw").textContent = formatMoney(record.withdraw || 0);
    $("kh2SelectedNote").textContent = record.note || t("noNote");
  }

  dateInput.value = today();
  renderSelected();

  dateInput.addEventListener("change", renderSelected);

  saveBtn.addEventListener("click", () => {
    const date = dateInput.value;
    if (!date) return showToast(runtime.currentLang === "vi" ? "Bạn chưa chọn ngày 😭" : "Choose a date 😭");

    commit(
      (data) => {
        data.kh2Daily[date] = {
          saved: savedInput.checked,
          withdraw: Math.max(0, Number(withdrawInput.value || 0)),
          note: noteInput.value.trim(),
          updatedAt: new Date().toISOString(),
        };
      },
      {
        activity: {
          action: runtime.currentLang === "vi" ? "Cập nhật KH2" : "Update KH2",
          detail: `${t("day")} ${date}`,
        },
        toast: runtime.currentLang === "vi" ? "Đã lưu ngày này ✅" : "Day saved ✅",
      },
    );
  });

  deleteBtn.addEventListener("click", () => deleteKh2HistoryDay(dateInput.value));
}

function selectKh2Date(date) {
  const dateInput = $("kh2DateInput");
  if (!date || !dateInput) return;

  dateInput.value = date;
  dateInput.dispatchEvent(new Event("change"));
  dateInput.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => dateInput.focus(), 320);
  showToast(runtime.currentLang === "vi" ? `Đã chọn ngày ${date}` : `Selected ${date}`);
}

function deleteKh2HistoryDay(date) {
  if (!date) return;

  if (!store.data.kh2Daily[date]) {
    showToast(runtime.currentLang === "vi" ? "Ngày này chưa có dữ liệu 😭" : "No data for this day 😭");
    return;
  }

  const ok = confirm(runtime.currentLang === "vi" ? `Xóa dữ liệu ngày ${date}?` : `Delete data of ${date}?`);
  if (!ok) return;

  commit(
    (data) => {
      delete data.kh2Daily[date];
    },
    {
      activity: {
        action: runtime.currentLang === "vi" ? "Xóa dữ liệu KH2" : "Delete KH2 record",
        detail: `${t("day")} ${date}`,
      },
      toast: runtime.currentLang === "vi" ? `Đã xóa ngày ${date}` : `Deleted ${date}`,
    },
  );
}

/* =========================================================
   CRUD
========================================================= */

function openAddModal(type = runtime.currentPage === "dashboard" ? "kh1" : runtime.currentPage) {
  if (!GROUPS.includes(type)) type = "kh1";

  dom.editId.value = "";
  dom.modalMode.textContent = t("modalNew");
  dom.modalTitle.textContent = t("modalAddTitle");
  dom.planType.value = type;
  dom.planName.value = "";
  dom.planDate.value = "";
  dom.planStatus.value = STATUS.todo;
  dom.planNote.value = "";

  dom.planModal.classList.add("show");
  setTimeout(() => dom.planName.focus(), 60);
}

function openEditModal(type, id) {
  const item = store.data[type]?.find((x) => x.id === id);
  if (!item) return;

  dom.editId.value = id;
  dom.modalMode.textContent = t("modalEdit");
  dom.modalTitle.textContent = t("modalEditTitle");
  dom.planType.value = type;
  dom.planName.value = item.name || "";
  dom.planDate.value = item.date || "";
  dom.planStatus.value = item.status || STATUS.todo;
  dom.planNote.value = item.note || "";

  dom.planModal.classList.add("show");
  setTimeout(() => dom.planName.focus(), 60);
}

function closeModal() {
  dom.planModal.classList.remove("show");
  dom.planForm.reset();
  dom.editId.value = "";
}

function deleteItem(type, id) {
  if (!GROUPS.includes(type)) return;
  if (!confirm(runtime.currentLang === "vi" ? "Bạn chắc chắn muốn xóa?" : "Delete this item?")) return;

  const item = store.data[type]?.find((x) => x.id === id);

  commit(
    (data) => {
      data[type] = data[type].filter((x) => x.id !== id);
    },
    {
      activity: {
        action: runtime.currentLang === "vi" ? "Xóa kế hoạch" : "Delete plan",
        detail: `${type.toUpperCase()} • ${item?.name || id}`,
      },
    },
  );
}

function moveItem(type, id, status) {
  if (!GROUPS.includes(type)) return;

  commit(
    (data) => {
      data[type] = data[type].map((item) =>
        item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
      );
    },
    {
      activity: {
        action: runtime.currentLang === "vi" ? "Đổi trạng thái" : "Change status",
        detail: `${type.toUpperCase()} → ${status}`,
      },
    },
  );
}

function handlePlanSubmit(event) {
  event.preventDefault();

  const type = dom.planType.value;
  const id = dom.editId.value;
  const name = dom.planName.value.trim();

  if (!GROUPS.includes(type) || !name) return;

  const now = new Date().toISOString();
  const payload = {
    id: id || uid(),
    name,
    date: dom.planDate.value,
    status: dom.planStatus.value,
    note: dom.planNote.value.trim(),
    updatedAt: now,
  };

  commit(
    (data) => {
      if (id) {
        data[type] = data[type].map((item) => (item.id === id ? { ...item, ...payload } : item));
      } else {
        data[type].push({ ...payload, createdAt: now });
      }
    },
    {
      activity: {
        action: id
          ? runtime.currentLang === "vi"
            ? "Sửa kế hoạch"
            : "Edit plan"
          : runtime.currentLang === "vi"
            ? "Thêm kế hoạch"
            : "Add plan",
        detail: `${type.toUpperCase()} • ${name}`,
      },
      render: false,
    },
  );

  closeModal();
  loadPage(runtime.currentPage);
}

/* =========================================================
   BACKUP / IMPORT / NOTIFICATIONS
========================================================= */

function exportData() {
  const payload = {
    ...store.data,
    exportedAt: new Date().toISOString(),
    app: "PlanOS",
    schemaVersion: 2,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `planos-backup-${today()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  showToast(t("copiedBackup"));
}

function triggerImport() {
  dom.importFileInput?.click();
}

async function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const nextData = normalizeData(parsed);

    store.data = nextData;
    addActivity(runtime.currentLang === "vi" ? "Import dữ liệu" : "Import data", file.name);
    invalidateAnalytics();
    saveLocal();
    saveCloud(true);
    loadPage(runtime.currentPage);
    showToast(t("importSuccess"));
  } catch (error) {
    console.error("Import error:", error);
    showToast(t("importError"));
  } finally {
    event.target.value = "";
  }
}

async function requestNotifications() {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  if (permission === "granted") showToast(t("notificationEnabled"));
}

function notifyDueItems() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const due = getDueItems(1);
  const kh2Passed = Boolean(store.data.kh2Daily?.[today()]?.saved);

  let body = runtime.currentLang === "vi" ? "Không có deadline gấp hôm nay." : "No urgent deadlines today.";

  if (due.length) {
    body = runtime.currentLang === "vi" ? `Bạn có ${due.length} mục cần chú ý.` : `You have ${due.length} urgent items.`;
  } else if (!kh2Passed) {
    body = runtime.currentLang === "vi" ? "KH2 hôm nay chưa PASS." : "KH2 has not passed today.";
  }

  new Notification("PlanOS", { body });
}

function manualSave() {
  saveCloud(true);
}

function manualLoad() {
  loadCloud(true);
}

/* =========================================================
   ROUTER
========================================================= */

const pageRenderers = {
  dashboard: renderDashboard,
  calendar: renderCalendar,
  kanban: renderKanban,
  insights: renderInsights,
  settings: renderSettings,
};

function loadPage(pageName) {
  if (!pageInfo[pageName]) pageName = "dashboard";

  runtime.currentPage = pageName;
  if (dom.pageTitle) dom.pageTitle.textContent = t(pageName);

  dom.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  const renderer = pageRenderers[pageName] || (() => renderKhPage(pageName));
  renderer();
  applyLanguage();
}

/* =========================================================
   EVENT DELEGATION
========================================================= */

function handleDocumentClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, group, id, status, date } = target.dataset;

  const actions = {
    "add-item": () => openAddModal(group),
    "edit-item": () => openEditModal(group, id),
    "delete-item": () => deleteItem(group, id),
    "move-item": () => moveItem(group, id, status),
    "select-kh2-date": () => selectKh2Date(date),
    "delete-kh2-day": () => deleteKh2HistoryDay(date),
    "export-data": () => exportData(),
    "import-data": () => triggerImport(),
    "request-notifications": () => requestNotifications(),
    "manual-save": () => manualSave(),
    "manual-load": () => manualLoad(),
  };

  actions[action]?.();
}

function bindEvents() {
  dom.loginForm?.addEventListener("submit", handleLogin);
  dom.logoutBtn?.addEventListener("click", logout);
  document.addEventListener("click", handleDocumentClick);

  dom.navItems.forEach((item) => {
    item.addEventListener("click", () => loadPage(item.dataset.page));
  });

  const debouncedSearch = debounce((value) => {
    runtime.searchQuery = value;
    loadPage(runtime.currentPage);
  }, CONFIG.searchDelay);

  dom.globalSearch?.addEventListener("input", (event) => {
    debouncedSearch(event.target.value);
  });

  dom.langBtn?.addEventListener("click", () => {
    runtime.currentLang = runtime.currentLang === "vi" ? "en" : "vi";
    localStorage.setItem(CONFIG.storage.lang, runtime.currentLang);
    invalidateAnalytics();
    loadPage(runtime.currentPage);
    updateRealTimeClock();
  });

  dom.themeBtn?.addEventListener("click", toggleTheme);
  dom.addPlanBtn?.addEventListener("click", () => openAddModal());
  dom.closeModalBtn?.addEventListener("click", closeModal);
  dom.cancelModalBtn?.addEventListener("click", closeModal);
  dom.planForm?.addEventListener("submit", handlePlanSubmit);
  dom.importFileInput?.addEventListener("change", handleImport);

  dom.planModal?.addEventListener("click", (event) => {
    if (event.target === dom.planModal) closeModal();
  });

  document.addEventListener("keydown", handleKeyboardShortcuts);

  dom.cloudSaveBtn?.addEventListener("click", () => saveCloud(true));
  dom.cloudLoadBtn?.addEventListener("click", () => loadCloud(true));
  dom.notifyBtn?.addEventListener("click", requestNotifications);

  window.addEventListener("beforeunload", () => {
    saveLocal();
    if (runtime.saveTimer) clearTimeout(runtime.saveTimer);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveLocal();
  });
}

function handleKeyboardShortcuts(event) {
  if (event.key === "Escape" && dom.planModal?.classList.contains("show")) {
    closeModal();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    dom.globalSearch?.focus();
    dom.globalSearch?.select();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
    event.preventDefault();
    openAddModal();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveCloud(true);
  }
}

/* =========================================================
   CLOCK / INIT
========================================================= */

function updateRealTimeClock() {
  const clock = $("realTimeClock");
  const dateEl = $("realTimeDate");
  if (!clock || !dateEl) return;

  const now = new Date();

  clock.textContent = now.toLocaleTimeString(runtime.currentLang === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  dateEl.textContent = now.toLocaleDateString(runtime.currentLang === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function initApp() {
  bindEvents();
  applyThemeFromStorage();
  checkLogin();

  const loaded = await loadCloud(false);
  if (!loaded) saveLocal();

  loadPage("dashboard");
  updateRealTimeClock();
  runtime.clockTimer = setInterval(updateRealTimeClock, 1000);

  setTimeout(notifyDueItems, 1200);
}

/* =========================================================
   GLOBAL COMPATIBILITY
   Keep these because existing inline onclick in old HTML/templates may call them.
========================================================= */

Object.assign(window, {
  openAddModal,
  openEditModal,
  deleteItem,
  moveItem,
  exportData,
  triggerImport,
  requestNotifications,
  manualSave,
  manualLoad,
  deleteKh2HistoryDay,
});

initApp();
