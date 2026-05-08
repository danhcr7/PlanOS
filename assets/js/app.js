import { saveDataToCloud, loadDataFromCloud } from "./firebase.js";

/* =========================================================
   PLANOS APP.JS — UPGRADED VERSION
   - Compatible with current index.html / style.css
   - Better dashboard UX
   - Today Focus
   - Life Score
   - KH2 streak analytics
   - Search debounce
   - Safer import/export/cloud flow
========================================================= */

const LOGIN_USERNAME = "danhcr6sdd";
const LOGIN_PASSWORD = "thanhdanh7777";

const DAILY_SAVING = 15000;
const STORAGE_KEY = "planosData";
const LOGIN_KEY = "planosLoggedIn";
const THEME_KEY = "planosTheme";
const LANG_KEY = "planosLang";

const SAVE_DELAY = 550;
const SEARCH_DELAY = 180;
const MAX_ACTIVITY_LOG = 80;
const KH2_HEATMAP_DAYS = 60;

let currentPage = "dashboard";
let currentLang = localStorage.getItem(LANG_KEY) || "vi";
let searchQuery = "";
let saveTimer = null;
let searchTimer = null;
let isCloudSaving = false;
let pendingCloudSave = false;
let lastSaveAt = 0;
let appReady = false;

const defaultData = {
  kh1: [],
  kh2: [],
  kh3: [],
  kh4: [],
  kh5: [],
  kh6: [],
  kh2Daily: {},
  activityLog: [],
};

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
    focusNow: "Focus now",
    overdueItems: "Quá hạn",
    dueToday: "Hôm nay",
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
    focusNow: "Focus now",
    overdueItems: "Overdue",
    dueToday: "Today",
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
  },
};

const pageInfo = {
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
};

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

let appData = loadLocal();

/* =========================================================
   BASIC HELPERS
========================================================= */

function t(key) {
  return i18n[currentLang]?.[key] || i18n.vi[key] || key;
}

function getGroupKeys() {
  return ["kh1", "kh2", "kh3", "kh4", "kh5", "kh6"];
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

function uid() {
  return (
    crypto?.randomUUID?.() ||
    Date.now().toString(36) + Math.random().toString(36).slice(2)
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

function formatMoney(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function today() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(dateString, amount) {
  const d = new Date(dateString);
  d.setDate(d.getDate() + amount);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return t("noDate");
  const [y, m, d] = dateString.split("-");
  if (!y || !m || !d) return dateString;
  return `${d}/${m}/${y}`;
}

function daysBetween(dateString) {
  if (!dateString) return null;
  const now = new Date(today());
  const target = new Date(dateString);
  return Math.ceil((target - now) / 86400000);
}

function isWithinLastDays(isoString, days = 7) {
  if (!isoString) return false;
  const time = new Date(isoString).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= days * 86400000;
}

function badgeClass(status) {
  if (status === "Xong") return "green";
  if (status === "Quan trọng") return "red";
  if (status === "Doing") return "yellow";
  return "blue";
}

function statusLabel(status) {
  if (currentLang === "en" && status === "Quan trọng") return "Important";
  if (currentLang === "en" && status === "Xong") return "Done";
  return status || "Todo";
}

function setButtonBusy(button, isBusy, labelWhenBusy) {
  if (!button) return;

  if (isBusy) {
    button.dataset.oldText = button.textContent;
    button.textContent = labelWhenBusy;
    button.disabled = true;
    button.style.opacity = "0.72";
    return;
  }

  button.textContent = button.dataset.oldText || button.textContent;
  button.disabled = false;
  button.style.opacity = "";
}

function showToast(message) {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => dom.toast.classList.remove("show"), 1900);
}

/* =========================================================
   DATA / STORAGE
========================================================= */

function normalizeItem(item = {}) {
  return {
    id: item.id || uid(),
    name: String(item.name || item.title || "").trim(),
    date: item.date || "",
    status: item.status || "Todo",
    note: item.note || "",
    createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

function normalizeData(raw = {}) {
  const safe = { ...defaultData, ...(raw || {}) };
  const normalized = {
    kh1: [],
    kh2: [],
    kh3: [],
    kh4: [],
    kh5: [],
    kh6: [],
    kh2Daily: safe.kh2Daily || safe.kh2Data || {},
    activityLog: Array.isArray(safe.activityLog) ? safe.activityLog : [],
  };

  getGroupKeys().forEach((key) => {
    normalized[key] = Array.isArray(safe[key])
      ? safe[key].map(normalizeItem).filter((item) => item.name)
      : [];
  });

  normalized.kh2Daily = Object.fromEntries(
    Object.entries(normalized.kh2Daily || {}).map(([date, record]) => [
      date,
      {
        saved: Boolean(record?.saved),
        withdraw: Number(record?.withdraw || 0),
        note: record?.note || "",
        updatedAt: record?.updatedAt || new Date().toISOString(),
      },
    ]),
  );

  normalized.activityLog = normalized.activityLog
    .filter((log) => log && log.action)
    .slice(0, MAX_ACTIVITY_LOG);

  return normalized;
}

function loadLocal() {
  try {
    return normalizeData(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
  } catch (error) {
    console.warn("Local data parse error:", error);
    return normalizeData();
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

async function saveCloud(showMessage = false) {
  if (isCloudSaving) {
    pendingCloudSave = true;
    return;
  }

  isCloudSaving = true;
  pendingCloudSave = false;

  if (showMessage) setButtonBusy(dom.cloudSaveBtn, true, t("cloudSaving"));

  try {
    const payload = {
      ...appData,
      savedAt: new Date().toISOString(),
      version: Date.now(),
    };

    await saveDataToCloud(payload);
    lastSaveAt = Date.now();

    if (showMessage) showToast(t("cloudSaved"));
  } catch (error) {
    console.error("Firebase save error:", error);
    pendingCloudSave = true;
    if (showMessage) showToast(t("cloudError"));
  } finally {
    isCloudSaving = false;
    if (showMessage) setButtonBusy(dom.cloudSaveBtn, false);

    if (pendingCloudSave) {
      pendingCloudSave = false;
      setTimeout(() => saveCloud(false), 300);
    }
  }
}

function saveAll(showMessage = false) {
  saveLocal();
  clearTimeout(saveTimer);

  if (showMessage) {
    saveCloud(true);
    return;
  }

  saveTimer = setTimeout(() => saveCloud(false), SAVE_DELAY);
}

async function loadCloud(showMessage = false) {
  if (showMessage) setButtonBusy(dom.cloudLoadBtn, true, currentLang === "vi" ? "Đang tải..." : "Loading...");

  try {
    const data = await loadDataFromCloud();

    if (!data) {
      if (showMessage) showToast(t("cloudEmpty"));
      return false;
    }

    appData = normalizeData(data);
    saveLocal();
    loadPage(currentPage);

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

function addActivity(action, detail) {
  appData.activityLog.unshift({
    id: uid(),
    action,
    detail,
    at: new Date().toISOString(),
  });

  appData.activityLog = appData.activityLog.slice(0, MAX_ACTIVITY_LOG);
}

/* =========================================================
   SELECTORS / ANALYTICS
========================================================= */

function getAllItems() {
  return getGroupKeys().flatMap((key) =>
    appData[key].map((item) => ({ ...item, group: key })),
  );
}

function filterItems(items) {
  if (!searchQuery.trim()) return items;
  const q = searchQuery.trim().toLowerCase();

  return items.filter((item) =>
    [item.name, item.note, item.status, item.date, item.group, t(item.group)]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

function getDueItems(maxDays = 3) {
  return getAllItems()
    .filter((item) => item.status !== "Xong" && item.date)
    .map((item) => ({ ...item, daysLeft: daysBetween(item.date) }))
    .filter((item) => item.daysLeft !== null && item.daysLeft <= maxDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function getTodayFocusItems() {
  return getAllItems()
    .filter((item) => item.status !== "Xong")
    .map((item) => ({ ...item, daysLeft: item.date ? daysBetween(item.date) : null }))
    .filter(
      (item) =>
        item.status === "Quan trọng" ||
        item.daysLeft === null ||
        item.daysLeft <= 1,
    )
    .sort((a, b) => {
      const score = (item) => {
        if (item.daysLeft !== null && item.daysLeft < 0) return -100 + item.daysLeft;
        if (item.daysLeft === 0) return -50;
        if (item.status === "Quan trọng") return -20;
        if (item.daysLeft === 1) return -10;
        return 10;
      };
      return score(a) - score(b);
    })
    .slice(0, 6);
}

function getKh2Stats() {
  const records = Object.values(appData.kh2Daily || {});
  const passDays = records.filter((d) => d.saved).length;
  const totalSaved = passDays * DAILY_SAVING;
  const totalWithdraw = records.reduce((sum, d) => sum + Number(d.withdraw || 0), 0);

  const streaks = getKh2Streaks();
  const passRate60 = getKh2PassRate(KH2_HEATMAP_DAYS);

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
  const records = appData.kh2Daily || {};
  let current = 0;
  let best = 0;
  let running = 0;

  for (let i = KH2_HEATMAP_DAYS - 1; i >= 0; i--) {
    const date = addDays(today(), -i);
    if (records[date]?.saved) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  for (let i = 0; i < KH2_HEATMAP_DAYS; i++) {
    const date = addDays(today(), -i);
    if (records[date]?.saved) current += 1;
    else break;
  }

  return { current, best };
}

function getKh2PassRate(days = 60) {
  let pass = 0;
  let recorded = 0;

  for (let i = 0; i < days; i++) {
    const date = addDays(today(), -i);
    const record = appData.kh2Daily?.[date];
    if (record) recorded += 1;
    if (record?.saved) pass += 1;
  }

  if (!recorded) return 0;
  return Math.round((pass / days) * 100);
}

function getWeeklyStats() {
  const all = getAllItems();
  const completedThisWeek = all.filter(
    (item) => item.status === "Xong" && isWithinLastDays(item.updatedAt, 7),
  ).length;
  const addedThisWeek = all.filter((item) => isWithinLastDays(item.createdAt, 7)).length;

  let savedThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(today(), -i);
    if (appData.kh2Daily?.[date]?.saved) savedThisWeek += 1;
  }

  return { completedThisWeek, addedThisWeek, savedThisWeek };
}

function getLifeScore() {
  const all = getAllItems();
  const total = all.length;
  const done = all.filter((i) => i.status === "Xong").length;
  const overdue = all.filter((i) => i.status !== "Xong" && i.date && daysBetween(i.date) < 0).length;
  const important = all.filter((i) => i.status === "Quan trọng").length;
  const kh2 = getKh2Stats();

  const completionScore = total ? (done / total) * 35 : 18;
  const deadlineScore = clamp(30 - overdue * 7, 0, 30);
  const financeScore = kh2.balance >= 0 ? 20 : clamp(20 + kh2.balance / 50000, 0, 20);
  const consistencyScore = clamp(kh2.passRate60 / 100, 0, 1) * 15;
  const penalty = Math.min(important * 1.5, 8);

  const score = Math.round(clamp(completionScore + deadlineScore + financeScore + consistencyScore - penalty, 0, 100));

  let label = "Stable";
  if (score >= 85) label = currentLang === "vi" ? "Rất tốt" : "Excellent";
  else if (score >= 70) label = currentLang === "vi" ? "Ổn định" : "Stable";
  else if (score >= 50) label = currentLang === "vi" ? "Cần chú ý" : "Needs attention";
  else label = currentLang === "vi" ? "Cần xử lý" : "Critical";

  return { score, label, overdue, important };
}

function getAssistantAdvice() {
  const stats = getKh2Stats();
  const due = getDueItems(3);
  const life = getLifeScore();
  const todayKh2 = Boolean(appData.kh2Daily?.[today()]?.saved);

  if (currentLang === "en") {
    const arr = [
      `PlanOS Score is ${life.score}/100 — ${life.label}.`,
      stats.balance < 0
        ? `KH2 is negative by ${formatMoney(Math.abs(stats.balance))}. Prioritize refunding the fund.`
        : `KH2 is positive by ${formatMoney(stats.balance)}. Financial status looks stable.`,
    ];
    if (!todayKh2) arr.push("KH2 has not passed today yet.");
    if (due.length) arr.push(`${due.length} items are due soon.`);
    if (stats.currentStreak) arr.push(`Current KH2 streak: ${stats.currentStreak} days.`);
    return arr;
  }

  const arr = [
    `PlanOS Score hiện tại là ${life.score}/100 — ${life.label}.`,
    stats.balance < 0
      ? `KH2 đang âm ${formatMoney(Math.abs(stats.balance))}, nên ưu tiên bù quỹ.`
      : `KH2 đang dương ${formatMoney(stats.balance)}, tình hình tài chính ổn.`,
  ];
  if (!todayKh2) arr.push("KH2 hôm nay chưa PASS, nên cập nhật trước khi kết thúc ngày.");
  if (due.length) arr.push(`Có ${due.length} mục gần hạn, nên xử lý trước.`);
  if (stats.currentStreak) arr.push(`Bạn đang giữ streak KH2 ${stats.currentStreak} ngày.`);
  return arr;
}

/* =========================================================
   LANGUAGE / THEME
========================================================= */

function applyLanguage() {
  if (dom.globalSearch) dom.globalSearch.placeholder = t("search");
  if (dom.addPlanBtn) dom.addPlanBtn.textContent = t("add");
  if (dom.cloudSaveBtn && !isCloudSaving) dom.cloudSaveBtn.textContent = t("save");
  if (dom.cloudLoadBtn) dom.cloudLoadBtn.textContent = t("load");
  if (dom.logoutBtn) dom.logoutBtn.textContent = t("logout");
  if (dom.langBtn) dom.langBtn.textContent = currentLang.toUpperCase();
  if (dom.pageTitle) dom.pageTitle.textContent = t(currentPage);
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
  const saved = localStorage.getItem(THEME_KEY);
  document.body.classList.toggle("light", saved === "light");
  if (dom.themeBtn) dom.themeBtn.textContent = saved === "light" ? "☀️" : "🌙";
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  if (dom.themeBtn) dom.themeBtn.textContent = isLight ? "☀️" : "🌙";
}

/* =========================================================
   AUTH
========================================================= */

function checkLogin() {
  const ok = sessionStorage.getItem(LOGIN_KEY) === "true";

  if (ok) {
    dom.loginScreen?.classList.add("hide");
    dom.loadingScreen?.classList.remove("show");
    dom.app?.classList.remove("hide");
  } else {
    dom.loginScreen?.classList.remove("hide");
    dom.app?.classList.add("hide");
    dom.loadingScreen?.classList.remove("show");
  }

  return ok;
}

function handleLogin(event) {
  event.preventDefault();

  const username = dom.loginUsername?.value.trim();
  const password = dom.loginPassword?.value.trim();

  if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
    sessionStorage.setItem(LOGIN_KEY, "true");
    dom.loginError?.classList.remove("show");
    dom.loginScreen?.classList.add("hide");
    dom.app?.classList.add("hide");
    dom.loadingScreen?.classList.add("show");

    setTimeout(() => {
      dom.loadingScreen?.classList.remove("show");
      dom.app?.classList.remove("hide");
      loadPage(currentPage || "dashboard");
      applyLanguage();
      updateRealTimeClock();
      showToast(t("loginSuccess"));
    }, 2200);

    return;
  }

  dom.loginError?.classList.add("show");
  if (dom.loginPassword) dom.loginPassword.value = "";
}

function logout() {
  sessionStorage.removeItem(LOGIN_KEY);
  location.reload();
}

/* =========================================================
   RENDER HELPERS
========================================================= */

function statCard(title, value, desc, extraClass = "") {
  return `
    <div class="card ${extraClass}">
      <h3>${title}</h3>
      <p class="big">${value}</p>
      <p class="muted">${desc}</p>
    </div>
  `;
}

function renderScoreRing(score) {
  const angle = clamp(score, 0, 100) * 3.6;
  return `
    <div class="score-ring" style="--score-angle: ${angle}deg">
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
  const group = item.group || currentPage;
  const left = item.date ? daysBetween(item.date) : null;
  const dueText =
    left === null
      ? ""
      : left < 0
        ? ` • ${t("overdue")} ${Math.abs(left)} ${t("days")}`
        : ` • ${t("left")} ${left} ${t("days")}`;

  return `
    <div class="item">
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
        <button class="mini-btn" onclick="openEditModal('${group}', '${item.id}')">${t("edit")}</button>
        <button class="mini-btn danger" onclick="deleteItem('${group}', '${item.id}')">${t("delete")}</button>
      </div>
    </div>
  `;
}

/* =========================================================
   RENDER PAGES
========================================================= */

function renderDashboard() {
  const stats = getKh2Stats();
  const allItems = filterItems(getAllItems());
  const done = allItems.filter((i) => i.status === "Xong").length;
  const important = allItems.filter((i) => i.status === "Quan trọng").length;
  const due = getDueItems(3);
  const focus = getTodayFocusItems();
  const advice = getAssistantAdvice();
  const life = getLifeScore();
  const weekly = getWeeklyStats();
  const kh2Today = Boolean(appData.kh2Daily?.[today()]?.saved);

  dom.content.innerHTML = `
    <div class="grid">
      <div class="card hero">
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
            ${renderScoreRing(life.score)}
          </div>
          <div class="list">
            ${renderMiniMetric(t("systemHealth"), life.label, `${life.overdue} ${t("overdueItems")} • ${life.important} ${t("important")}`)}
            ${renderMiniMetric(t("kh2Today"), kh2Today ? t("passedToday") : t("notPassedToday"), `${t("currentStreak")}: ${stats.currentStreak} ${t("days")}`)}
          </div>
        </div>

        <div class="card">
          <div class="section-head">
            <div>
              <h3>${t("todayFocus")}</h3>
              <p class="muted">${t("todayFocusDesc")}</p>
            </div>
            <button class="primary-btn" onclick="openAddModal('kh1')">${t("addPlan")}</button>
          </div>
          <div class="list">
            ${focus.length ? focus.map(renderItem).join("") : `<p class="muted">${t("noTodayFocus")}</p>`}
          </div>
        </div>
      </div>

      <div class="grid grid-4">
        ${statCard(t("totalItems"), allItems.length, t("totalSystem"))}
        ${statCard(t("completed"), done, t("completedDesc"))}
        ${statCard(t("important"), important, t("importantDesc"))}
        ${statCard(t("kh2Balance"), formatMoney(stats.balance), t("balanceDesc"), stats.balance < 0 ? "danger-text" : "success-text")}
      </div>

      <div class="grid grid-4">
        ${statCard(t("currentStreak"), stats.currentStreak, "KH2")}
        ${statCard(t("bestStreak"), stats.bestStreak, "KH2")}
        ${statCard(t("passRate"), `${stats.passRate60}%`, "KH2")}
        ${statCard(t("fundBalance"), formatMoney(stats.balance), t("balanceDesc"), stats.balance < 0 ? "danger-text" : "success-text")}
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
            ${renderMiniMetric(t("completedThisWeek"), weekly.completedThisWeek)}
            ${renderMiniMetric(t("addedThisWeek"), weekly.addedThisWeek)}
            ${renderMiniMetric(t("savedThisWeek"), `${weekly.savedThisWeek}/7`)}
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("dueTitle")}</h3>
          <div class="list">
            ${due.length ? due.slice(0, 6).map(renderItem).join("") : `<p class="muted">${t("noDue")}</p>`}
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
  `;
}

function renderKhPage(key) {
  if (key === "kh2") return renderKh2();

  const items = filterItems(appData[key].map((item) => ({ ...item, group: key })));

  dom.content.innerHTML = `
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
          <button class="primary-btn" onclick="openAddModal('${key}')">
            ${t("addTo")} ${key.toUpperCase()}
          </button>
        </div>

        <div class="list">
          ${items.length ? items.map(renderItem).join("") : `<p class="muted">${t("emptyInGroup")} ${key.toUpperCase()}.</p>`}
        </div>
      </div>
    </div>
  `;
}

function renderKh2() {
  const s = getKh2Stats();

  dom.content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero">
        <h2>💰 ${t("kh2")}</h2>
        <p>${t("kh2Desc")}</p>
      </div>

      <div class="grid grid-4">
        ${statCard(t("passDays"), s.passDays, t("passDaysDesc"))}
        ${statCard(t("currentStreak"), s.currentStreak, "KH2")}
        ${statCard(t("bestStreak"), s.bestStreak, "KH2")}
        ${statCard(t("passRate"), `${s.passRate60}%`, `Last ${KH2_HEATMAP_DAYS} days`)}
      </div>

      <div class="grid grid-4">
        ${statCard(t("totalSaved"), formatMoney(s.totalSaved), t("totalSavedDesc"))}
        ${statCard(t("totalWithdraw"), formatMoney(s.totalWithdraw), t("totalWithdrawDesc"))}
        ${statCard(t("fundBalance"), formatMoney(s.balance), t("balanceDesc"), s.balance < 0 ? "danger-text" : "success-text")}
        ${statCard(t("kh2Today"), appData.kh2Daily?.[today()]?.saved ? t("passedToday") : t("notPassedToday"), formatDate(today()))}
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
          <button class="primary-btn" onclick="openAddModal('kh2')">${t("addKh2")}</button>
        </div>
        <div class="list">
          ${appData.kh2.length ? appData.kh2.map((i) => renderItem({ ...i, group: "kh2" })).join("") : `<p class="muted">${t("kh2Empty")}</p>`}
        </div>
      </div>

      <div class="card">
        <h3>${t("history")}</h3>
        <div class="list">${renderKh2History()}</div>
      </div>
    </div>
  `;

  initKh2Form();
  initKh2HeatmapClick();
}

function renderKh2Heatmap() {
  const cells = [];

  for (let i = KH2_HEATMAP_DAYS - 1; i >= 0; i--) {
    const key = addDays(today(), -i);
    const record = appData.kh2Daily[key];

    let cls = "heat-cell empty-cell";
    if (record?.saved) cls = "heat-cell pass-cell";
    if (record && !record.saved) cls = "heat-cell fail-cell";

    cells.push(`
      <button
        type="button"
        class="${cls}"
        title="${key}"
        aria-label="KH2 ${key}"
        data-date="${key}"
      ></button>
    `);
  }

  return cells.join("");
}

function renderKh2History() {
  const entries = Object.entries(appData.kh2Daily || {}).sort((a, b) => b[0].localeCompare(a[0]));

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
              onclick="deleteKh2HistoryDay('${date}')"
              title="${currentLang === "vi" ? "Xóa ngày này" : "Delete this day"}"
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
  const items = filterItems(getAllItems())
    .filter((i) => i.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const grouped = items.reduce((acc, item) => {
    acc[item.date] ||= [];
    acc[item.date].push(item);
    return acc;
  }, {});

  dom.content.innerHTML = `
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
  `;
}

function renderKanban() {
  const items = filterItems(getAllItems());
  const cols = [
    { key: "Todo", title: "Todo" },
    { key: "Doing", title: "Doing" },
    { key: "Quan trọng", title: currentLang === "vi" ? "Quan trọng" : "Important" },
    { key: "Xong", title: currentLang === "vi" ? "Xong" : "Done" },
  ];

  dom.content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero"><h2>🧲 ${t("kanban")}</h2><p>${t("kanbanDesc")}</p></div>
      <div class="kanban">
        ${cols
          .map((col) => {
            const list = items.filter((i) => (i.status || "Todo") === col.key);
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
  `;
}

function renderKanbanCard(item) {
  return `
    <div class="kanban-card">
      <strong>${escapeHTML(item.name)}</strong>
      <p class="muted">${item.group.toUpperCase()} ${item.date ? "• " + formatDate(item.date) : ""}</p>
      <div class="kanban-actions">
        <button class="mini-btn" onclick="moveItem('${item.group}', '${item.id}', 'Todo')">Todo</button>
        <button class="mini-btn" onclick="moveItem('${item.group}', '${item.id}', 'Doing')">Doing</button>
        <button class="mini-btn" onclick="moveItem('${item.group}', '${item.id}', 'Quan trọng')">🔥</button>
        <button class="mini-btn" onclick="moveItem('${item.group}', '${item.id}', 'Xong')">✅</button>
      </div>
    </div>
  `;
}

function renderInsights() {
  const all = getAllItems();
  const s = getKh2Stats();
  const life = getLifeScore();
  const groups = getGroupKeys();

  dom.content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero"><h2>📊 ${t("insights")}</h2><p>${t("insightsDesc")}</p></div>

      <div class="grid grid-4">
        ${statCard(t("lifeScore"), `${life.score}/100`, life.label)}
        ${statCard(t("totalItems"), all.length, t("totalSystem"))}
        ${statCard(t("passDays"), s.passDays, t("passDaysDesc"))}
        ${statCard(t("fundBalance"), formatMoney(s.balance), "KH2", s.balance < 0 ? "danger-text" : "success-text")}
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("groupDistribution")}</h3>
          <div class="list">
            ${groups
              .map((key) => renderMiniMetric(t(key), appData[key].length, key.toUpperCase()))
              .join("")}
          </div>
        </div>

        <div class="card">
          <h3>${t("activityLog")}</h3>
          <div class="list">
            ${
              appData.activityLog.length
                ? appData.activityLog
                    .slice(0, 24)
                    .map(
                      (log) => `
                        <div class="item">
                          <div>
                            <strong>${escapeHTML(log.action)}</strong>
                            <p class="muted">${escapeHTML(log.detail)} • ${new Date(log.at).toLocaleString(currentLang === "vi" ? "vi-VN" : "en-US")}</p>
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
  `;
}

function renderSettings() {
  dom.content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero"><h2>⚙️ ${t("settings")}</h2><p>${t("toolsDesc")}</p></div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("exportData")}</h3>
          <p class="muted">${t("exportDesc")}</p>
          <button class="primary-btn" onclick="exportData()">Export JSON</button>
        </div>
        <div class="card">
          <h3>${t("importData")}</h3>
          <p class="muted">${t("importDesc")}</p>
          <button class="primary-btn" onclick="triggerImport()">Import JSON</button>
        </div>
        <div class="card">
          <h3>${t("browserNotification")}</h3>
          <p class="muted">${t("notificationDesc")}</p>
          <button class="primary-btn" onclick="requestNotifications()">${t("enableNotification")}</button>
        </div>
        <div class="card">
          <h3>☁ Firebase</h3>
          <p class="muted">${t("firebaseDesc")}</p>
          <div class="tool-row">
            <button class="primary-btn" onclick="manualSave()">Save Cloud</button>
            <button class="ghost-btn" onclick="manualLoad()">Load Cloud</button>
          </div>
        </div>
      </div>
    </div>
  `;
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
    const record = appData.kh2Daily[date] || { saved: false, withdraw: 0, note: "" };

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
    if (!date) return showToast(currentLang === "vi" ? "Bạn chưa chọn ngày 😭" : "Choose a date 😭");

    appData.kh2Daily[date] = {
      saved: savedInput.checked,
      withdraw: Math.max(0, Number(withdrawInput.value || 0)),
      note: noteInput.value.trim(),
      updatedAt: new Date().toISOString(),
    };

    addActivity(currentLang === "vi" ? "Cập nhật KH2" : "Update KH2", `${t("day")} ${date}`);
    saveAll();
    renderKh2();
    showToast(currentLang === "vi" ? "Đã lưu ngày này ✅" : "Day saved ✅");
  });

  deleteBtn.addEventListener("click", () => {
    const date = dateInput.value;
    if (!appData.kh2Daily[date]) {
      return showToast(currentLang === "vi" ? "Ngày này chưa có dữ liệu 😭" : "No data for this day 😭");
    }
    if (!confirm(currentLang === "vi" ? "Xóa ngày này?" : "Delete this day?")) return;

    delete appData.kh2Daily[date];
    addActivity(currentLang === "vi" ? "Xóa dữ liệu KH2" : "Delete KH2 record", `${t("day")} ${date}`);
    saveAll();
    renderKh2();
  });
}

function initKh2HeatmapClick() {
  $$(".heat-cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      const date = cell.dataset.date;
      const dateInput = $("kh2DateInput");
      if (!date || !dateInput) return;

      dateInput.value = date;
      dateInput.dispatchEvent(new Event("change"));
      dateInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => dateInput.focus(), 360);
      showToast(currentLang === "vi" ? `Đã chọn ngày ${date}` : `Selected ${date}`);
    });
  });
}

function deleteKh2HistoryDay(date) {
  const ok = confirm(currentLang === "vi" ? `Xóa dữ liệu ngày ${date}?` : `Delete data of ${date}?`);
  if (!ok) return;

  delete appData.kh2Daily[date];
  addActivity(currentLang === "vi" ? "Xóa nhanh lịch sử KH2" : "Quick delete KH2 history", `${t("day")} ${date}`);
  saveAll();
  renderKh2();
  showToast(currentLang === "vi" ? `Đã xóa ngày ${date}` : `Deleted ${date}`);
}

/* =========================================================
   CRUD
========================================================= */

function openAddModal(type = currentPage === "dashboard" ? "kh1" : currentPage) {
  if (!getGroupKeys().includes(type)) type = "kh1";

  dom.editId.value = "";
  dom.modalMode.textContent = t("modalNew");
  dom.modalTitle.textContent = t("modalAddTitle");
  dom.planType.value = type;
  dom.planName.value = "";
  dom.planDate.value = "";
  dom.planStatus.value = "Todo";
  dom.planNote.value = "";

  dom.planModal.classList.add("show");
  setTimeout(() => dom.planName.focus(), 60);
}

function openEditModal(type, id) {
  const item = appData[type]?.find((x) => x.id === id);
  if (!item) return;

  dom.editId.value = id;
  dom.modalMode.textContent = t("modalEdit");
  dom.modalTitle.textContent = t("modalEditTitle");
  dom.planType.value = type;
  dom.planName.value = item.name || "";
  dom.planDate.value = item.date || "";
  dom.planStatus.value = item.status || "Todo";
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
  if (!confirm(currentLang === "vi" ? "Bạn chắc chắn muốn xóa?" : "Delete this item?")) return;

  const item = appData[type]?.find((x) => x.id === id);
  appData[type] = appData[type].filter((x) => x.id !== id);

  addActivity(currentLang === "vi" ? "Xóa kế hoạch" : "Delete plan", `${type.toUpperCase()} • ${item?.name || id}`);
  saveAll();
  loadPage(currentPage);
}

function moveItem(type, id, status) {
  appData[type] = appData[type].map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
  );

  addActivity(currentLang === "vi" ? "Đổi trạng thái" : "Change status", `${type.toUpperCase()} → ${status}`);
  saveAll();
  loadPage(currentPage);
}

function handlePlanSubmit(event) {
  event.preventDefault();

  const type = dom.planType.value;
  const id = dom.editId.value;
  const name = dom.planName.value.trim();

  if (!name) return;

  const now = new Date().toISOString();
  const payload = {
    id: id || uid(),
    name,
    date: dom.planDate.value,
    status: dom.planStatus.value,
    note: dom.planNote.value.trim(),
    updatedAt: now,
  };

  if (id) {
    appData[type] = appData[type].map((item) => (item.id === id ? { ...item, ...payload } : item));
    addActivity(currentLang === "vi" ? "Sửa kế hoạch" : "Edit plan", `${type.toUpperCase()} • ${name}`);
  } else {
    appData[type].push({ ...payload, createdAt: now });
    addActivity(currentLang === "vi" ? "Thêm kế hoạch" : "Add plan", `${type.toUpperCase()} • ${name}`);
  }

  saveAll();
  closeModal();
  loadPage(currentPage);
}

/* =========================================================
   BACKUP / IMPORT / NOTIFICATIONS
========================================================= */

function exportData() {
  const payload = {
    ...appData,
    exportedAt: new Date().toISOString(),
    app: "PlanOS",
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `planos-backup-${today()}.json`;
  a.click();

  URL.revokeObjectURL(url);
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
    appData = normalizeData(parsed);

    addActivity(currentLang === "vi" ? "Import dữ liệu" : "Import data", file.name);
    saveAll(true);
    loadPage(currentPage);
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
  const kh2Passed = Boolean(appData.kh2Daily?.[today()]?.saved);

  let body = currentLang === "vi" ? "Không có deadline gấp hôm nay." : "No urgent deadlines today.";

  if (due.length) {
    body = currentLang === "vi" ? `Bạn có ${due.length} mục cần chú ý.` : `You have ${due.length} urgent items.`;
  } else if (!kh2Passed) {
    body = currentLang === "vi" ? "KH2 hôm nay chưa PASS." : "KH2 has not passed today.";
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

function loadPage(pageName) {
  if (!pageInfo[pageName]) pageName = "dashboard";

  currentPage = pageName;
  if (dom.pageTitle) dom.pageTitle.textContent = t(pageName);

  dom.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  if (!dom.content) return;

  if (pageName === "dashboard") renderDashboard();
  else if (pageName === "calendar") renderCalendar();
  else if (pageName === "kanban") renderKanban();
  else if (pageName === "insights") renderInsights();
  else if (pageName === "settings") renderSettings();
  else renderKhPage(pageName);

  applyLanguage();
}

/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {
  dom.loginForm?.addEventListener("submit", handleLogin);
  dom.logoutBtn?.addEventListener("click", logout);

  dom.navItems.forEach((item) => {
    item.addEventListener("click", () => loadPage(item.dataset.page));
  });

  dom.globalSearch?.addEventListener("input", (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = event.target.value;
      loadPage(currentPage);
    }, SEARCH_DELAY);
  });

  dom.langBtn?.addEventListener("click", () => {
    currentLang = currentLang === "vi" ? "en" : "vi";
    localStorage.setItem(LANG_KEY, currentLang);
    loadPage(currentPage);
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dom.planModal?.classList.contains("show")) closeModal();

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      dom.globalSearch?.focus();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
      event.preventDefault();
      openAddModal();
    }
  });

  dom.cloudSaveBtn?.addEventListener("click", () => saveCloud(true));
  dom.cloudLoadBtn?.addEventListener("click", () => loadCloud(true));
  dom.notifyBtn?.addEventListener("click", requestNotifications);

  window.addEventListener("beforeunload", () => {
    saveLocal();
    if (saveTimer) clearTimeout(saveTimer);
  });
}

/* =========================================================
   CLOCK / INIT
========================================================= */

function updateRealTimeClock() {
  const clock = $("realTimeClock");
  const dateEl = $("realTimeDate");
  if (!clock || !dateEl) return;

  const now = new Date();

  clock.textContent = now.toLocaleTimeString(currentLang === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  dateEl.textContent = now.toLocaleDateString(currentLang === "vi" ? "vi-VN" : "en-US", {
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

  appReady = true;
  setTimeout(notifyDueItems, 1200);
}

setInterval(updateRealTimeClock, 1000);

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;
window.moveItem = moveItem;
window.exportData = exportData;
window.triggerImport = triggerImport;
window.requestNotifications = requestNotifications;
window.manualSave = manualSave;
window.manualLoad = manualLoad;
window.deleteKh2HistoryDay = deleteKh2HistoryDay;

initApp();
