import { saveDataToCloud, loadDataFromCloud } from "./firebase.js";

/* =========================
   CONFIG
========================= */

const LOGIN_USERNAME = "danhcr6sdd";
const LOGIN_PASSWORD = "thanhdanh7777";

const DAILY_SAVING = 15000;
const STORAGE_KEY = "planosData";
const LOGIN_KEY = "planosLoggedIn";
const THEME_KEY = "planosTheme";
const LANG_KEY = "planosLang";

let currentPage = "dashboard";
let currentLang = localStorage.getItem(LANG_KEY) || "vi";
let searchQuery = "";
let saveTimer = null;
let isCloudSaving = false;

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
    kh1: "KH1 - Học tập",
    kh2: "KH2 - Tiết kiệm 15K/ngày",
    kh3: "KH3 - Dự phòng",
    kh4: "KH4 - Wishlist sách",
    kh5: "KH5 - Góp laptop",
    kh6: "KH6 - Góp MoMo",
    calendar: "Calendar Timeline",
    kanban: "Kanban Board",
    insights: "Insights & Analytics",
    settings: "Công cụ dữ liệu",

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

    heroTitle: "Personal Plan Dashboard ✨",
    heroDesc:
      "Trung tâm quản lý KH1 đến KH6. Có CRUD, auto-save Firebase, calendar, kanban, heatmap, analytics, notification, import/export và assistant phân tích nhanh.",

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

    listTitle: "Danh sách",
    crudDesc: "Có đủ 3 chức năng: thêm, sửa, xóa.",
    emptyInGroup: "Chưa có mục nào trong",
    addTo: "+ Thêm vào",

    kh2PassDays: "Tổng ngày PASS",
    kh2PassDaysDesc: "Ngày đã thêm 15K",
    kh2TotalSaved: "Tổng đã thêm",
    kh2TotalSavedDesc: "PASS × 15.000đ",
    kh2TotalWithdraw: "Tổng đã rút",
    kh2TotalWithdrawDesc: "Tiền lấy từ quỹ",
    kh2FundBalance: "Số dư quỹ",

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
    notRecorded: "chưa ghi",
    pass: "PASS",
    notPass: "Chưa PASS",

    calendarDesc: "Xem tất cả deadline, lịch góp, lịch học theo ngày.",
    noDateItems: "Chưa có mục nào có ngày.",
    kanbanDesc: "Chuyển trạng thái nhanh giữa Todo, Doing, Quan trọng và Done.",
    empty: "Trống.",
    insightsDesc: "Thống kê nhanh, achievement và lịch sử hoạt động của PlanOS.",
    passKh2: "PASS KH2",
    passKh2Desc: "Ngày đã tiết kiệm",
    totalKh2: "Tổng KH2",
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

    modalNew: "New item",
    modalEdit: "Edit item",
    modalAddTitle: "Thêm kế hoạch",
    modalEditTitle: "Sửa kế hoạch",
    group: "Nhóm KH",
    title: "Tiêu đề",
    dateDeadline: "Ngày / deadline",
    status: "Trạng thái",
    cancel: "Hủy",
    formSave: "Lưu",

    edit: "Sửa",
    delete: "Xóa",
    overdue: "Quá hạn",
    days: "ngày",
    left: "Còn",
    noDate: "Không có ngày",

    sideOk: "Sẵn sàng làm việc 🔥",
    sideWarning: "KH2 cần bù quỹ ⚠️",

    loginSuccess: "Đăng nhập thành công 🔐",
    cloudSaved: "Đã lưu cloud ☁️",
    cloudSaveError: "Lỗi lưu cloud 😭",
    cloudEmpty: "Cloud chưa có dữ liệu 😭",
    cloudLoaded: "Đã tải cloud 🔄",
    cloudLoadError: "Lỗi tải cloud 😭",
  },

  en: {
    dashboard: "Plan Overview",
    kh1: "KH1 - Study",
    kh2: "KH2 - 15K/day Saving",
    kh3: "KH3 - Backup",
    kh4: "KH4 - Book Wishlist",
    kh5: "KH5 - Laptop Installment",
    kh6: "KH6 - MoMo Installment",
    calendar: "Calendar Timeline",
    kanban: "Kanban Board",
    insights: "Insights & Analytics",
    settings: "Data Tools",

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

    heroTitle: "Personal Plan Dashboard ✨",
    heroDesc:
      "A central hub for KH1 to KH6 with CRUD, Firebase auto-save, calendar, kanban, heatmap, analytics, notifications, import/export and quick assistant insights.",

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

    listTitle: "List",
    crudDesc: "Includes three core actions: add, edit and delete.",
    emptyInGroup: "No items in",
    addTo: "+ Add to",

    kh2PassDays: "PASS Days",
    kh2PassDaysDesc: "Days with 15K added",
    kh2TotalSaved: "Total Saved",
    kh2TotalSavedDesc: "PASS × 15,000đ",
    kh2TotalWithdraw: "Total Withdrawn",
    kh2TotalWithdrawDesc: "Money taken from fund",
    kh2FundBalance: "Fund Balance",

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
    notRecorded: "not recorded",
    pass: "PASS",
    notPass: "Not PASS",

    calendarDesc: "View all deadlines, installment dates and study plans by date.",
    noDateItems: "No dated items yet.",
    kanbanDesc: "Quickly move items between Todo, Doing, Important and Done.",
    empty: "Empty.",
    insightsDesc: "Quick stats, achievements and PlanOS activity history.",
    passKh2: "KH2 PASS",
    passKh2Desc: "Saving days",
    totalKh2: "KH2 total",
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

    modalNew: "New item",
    modalEdit: "Edit item",
    modalAddTitle: "Add Plan",
    modalEditTitle: "Edit Plan",
    group: "Group",
    title: "Title",
    dateDeadline: "Date / deadline",
    status: "Status",
    cancel: "Cancel",
    formSave: "Save",

    edit: "Edit",
    delete: "Delete",
    overdue: "Overdue",
    days: "days",
    left: "Left",
    noDate: "No date",

    sideOk: "Ready to work 🔥",
    sideWarning: "KH2 needs refund ⚠️",

    loginSuccess: "Login successful 🔐",
    cloudSaved: "Cloud saved ☁️",
    cloudSaveError: "Cloud save error 😭",
    cloudEmpty: "No cloud data yet 😭",
    cloudLoaded: "Cloud loaded 🔄",
    cloudLoadError: "Cloud load error 😭",
  },
};

const pageInfo = {
  dashboard: { icon: "🏠", descKey: "" },
  kh1: { icon: "📚", descKey: "kh1Desc" },
  kh2: { icon: "💰", descKey: "kh2Desc" },
  kh3: { icon: "🧩", descKey: "kh3Desc" },
  kh4: { icon: "📖", descKey: "kh4Desc" },
  kh5: { icon: "💻", descKey: "kh5Desc" },
  kh6: { icon: "💳", descKey: "kh6Desc" },
  calendar: { icon: "📅", descKey: "calendarDesc" },
  kanban: { icon: "🧲", descKey: "kanbanDesc" },
  insights: { icon: "📊", descKey: "insightsDesc" },
  settings: { icon: "⚙️", descKey: "toolsDesc" },
};

/* =========================
   DOM
========================= */

const $ = (id) => document.getElementById(id);

const content = $("content");
const pageTitle = $("pageTitle");
const navItems = document.querySelectorAll(".nav-item");

const themeBtn = $("themeBtn");
const addPlanBtn = $("addPlanBtn");
const cloudSaveBtn = $("cloudSaveBtn");
const cloudLoadBtn = $("cloudLoadBtn");
const notifyBtn = $("notifyBtn");
const globalSearch = $("globalSearch");
const importFileInput = $("importFileInput");

const planModal = $("planModal");
const modalMode = $("modalMode");
const modalTitle = $("modalTitle");
const closeModalBtn = $("closeModalBtn");
const cancelModalBtn = $("cancelModalBtn");
const planForm = $("planForm");

const editId = $("editId");
const planType = $("planType");
const planName = $("planName");
const planDate = $("planDate");
const planStatus = $("planStatus");
const planNote = $("planNote");

const toast = $("toast");
const sideStatus = $("sideStatus");

const loginScreen = $("loginScreen");
const loginForm = $("loginForm");
const loginUsername = $("loginUsername");
const loginPassword = $("loginPassword");
const loginError = $("loginError");
const logoutBtn = $("logoutBtn");
const langBtn = $("langBtn");

/* =========================
   LANGUAGE
========================= */

function t(key) {
  return i18n[currentLang]?.[key] || i18n.vi[key] || key;
}

function applyLanguage() {
  if (globalSearch) globalSearch.placeholder = t("search");
  if (addPlanBtn) addPlanBtn.textContent = t("add");
  if (cloudSaveBtn) cloudSaveBtn.textContent = t("save");
  if (cloudLoadBtn) cloudLoadBtn.textContent = t("load");
  if (logoutBtn) logoutBtn.textContent = t("logout");
  if (langBtn) langBtn.textContent = currentLang.toUpperCase();
  if (pageTitle) pageTitle.textContent = t(currentPage);
}

/* =========================
   DATA
========================= */

function normalizeData(raw = {}) {
  const safe = { ...defaultData, ...raw };

  return {
    kh1: Array.isArray(safe.kh1) ? safe.kh1 : [],
    kh2: Array.isArray(safe.kh2) ? safe.kh2 : [],
    kh3: Array.isArray(safe.kh3) ? safe.kh3 : [],
    kh4: Array.isArray(safe.kh4) ? safe.kh4 : [],
    kh5: Array.isArray(safe.kh5) ? safe.kh5 : [],
    kh6: Array.isArray(safe.kh6) ? safe.kh6 : [],
    kh2Daily: safe.kh2Daily || safe.kh2Data || {},
    activityLog: Array.isArray(safe.activityLog) ? safe.activityLog : [],
  };
}

function loadLocal() {
  try {
    return normalizeData(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
  } catch {
    return normalizeData();
  }
}

let appData = loadLocal();

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

async function saveCloud(showMessage = false) {
  if (isCloudSaving) return;

  isCloudSaving = true;

  try {
    await saveDataToCloud({
      ...appData,
      savedAt: new Date().toISOString(),
    });

    if (showMessage) showToast(t("cloudSaved"));
  } catch (error) {
    console.error("Firebase save error:", error);
    if (showMessage) showToast(t("cloudSaveError"));
  } finally {
    isCloudSaving = false;
  }
}

function saveAll(showMessage = false) {
  saveLocal();
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    saveCloud(showMessage);
  }, showMessage ? 0 : 700);
}

async function loadCloud(showMessage = false) {
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
    if (showMessage) showToast(t("cloudLoadError"));
    return false;
  }
}

/* =========================
   HELPERS
========================= */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
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
  return Number(amount || 0).toLocaleString("vi-VN") + "đ";
}

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return t("noDate");
  const [y, m, d] = dateString.split("-");
  return `${d}/${m}/${y}`;
}

function daysBetween(dateString) {
  if (!dateString) return null;

  const now = new Date(today());
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();

  return Math.ceil(diff / 86400000);
}

function getGroupKeys() {
  return ["kh1", "kh2", "kh3", "kh4", "kh5", "kh6"];
}

function badgeClass(status) {
  if (status === "Xong") return "green";
  if (status === "Quan trọng") return "red";
  if (status === "Doing") return "yellow";
  return "blue";
}

function groupTitle(key) {
  return t(key);
}

function addActivity(action, detail) {
  appData.activityLog.unshift({
    id: uid(),
    action,
    detail,
    at: new Date().toISOString(),
  });

  appData.activityLog = appData.activityLog.slice(0, 50);
}

function getAllItems() {
  return getGroupKeys().flatMap((key) =>
    appData[key].map((item) => ({
      ...item,
      group: key,
    })),
  );
}

function filterItems(items) {
  if (!searchQuery.trim()) return items;

  const q = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    const haystack = [
      item.name,
      item.note,
      item.status,
      item.date,
      item.group,
      groupTitle(item.group),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

function getDueItems(maxDays = 3) {
  return getAllItems()
    .filter((item) => item.status !== "Xong" && item.date)
    .map((item) => ({
      ...item,
      daysLeft: daysBetween(item.date),
    }))
    .filter((item) => item.daysLeft !== null && item.daysLeft <= maxDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/* =========================
   LOGIN
========================= */

function checkLogin() {
  const isLoggedIn = sessionStorage.getItem(LOGIN_KEY) === "true";

  if (isLoggedIn && loginScreen) {
    loginScreen.classList.add("hide");
  }
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
    sessionStorage.setItem(LOGIN_KEY, "true");
    loginScreen.classList.add("hide");
    loginError.classList.remove("show");
    showToast(t("loginSuccess"));
    return;
  }

  loginError.classList.add("show");
  loginPassword.value = "";
  loginPassword.focus();
});

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem(LOGIN_KEY);
  location.reload();
});

/* =========================
   STATS
========================= */

function getKh2Stats() {
  const records = Object.values(appData.kh2Daily || {});
  const passDays = records.filter((day) => day.saved).length;
  const totalSaved = passDays * DAILY_SAVING;
  const totalWithdraw = records.reduce(
    (sum, day) => sum + Number(day.withdraw || 0),
    0,
  );

  return {
    passDays,
    totalSaved,
    totalWithdraw,
    balance: totalSaved - totalWithdraw,
  };
}

function getAchievements() {
  const stats = getKh2Stats();
  const all = getAllItems();
  const done = all.filter((item) => item.status === "Xong").length;
  const important = all.filter((item) => item.status === "Quan trọng").length;

  return [
    {
      icon: "🏆",
      title: "Starter",
      desc: currentLang === "vi" ? "Tạo ít nhất 1 kế hoạch" : "Create at least 1 plan",
      unlocked: all.length >= 1,
    },
    {
      icon: "✅",
      title: "Finisher",
      desc: currentLang === "vi" ? "Hoàn thành ít nhất 5 task" : "Complete at least 5 tasks",
      unlocked: done >= 5,
    },
    {
      icon: "🔥",
      title: "Priority Hunter",
      desc: currentLang === "vi" ? "Có ít nhất 3 mục quan trọng" : "Have at least 3 important items",
      unlocked: important >= 3,
    },
    {
      icon: "💰",
      title: "Saver",
      desc: currentLang === "vi" ? "PASS tiết kiệm ít nhất 7 ngày" : "Pass saving for at least 7 days",
      unlocked: stats.passDays >= 7,
    },
    {
      icon: "📚",
      title: "Study Mode",
      desc: currentLang === "vi" ? "Có ít nhất 5 mục trong KH1" : "Have at least 5 KH1 items",
      unlocked: appData.kh1.length >= 5,
    },
    {
      icon: "📖",
      title: "Book Collector",
      desc: currentLang === "vi" ? "Có ít nhất 5 cuốn trong KH4" : "Have at least 5 KH4 books",
      unlocked: appData.kh4.length >= 5,
    },
  ];
}

function getAssistantAdvice() {
  const stats = getKh2Stats();
  const due = getDueItems(3);
  const all = getAllItems();
  const doing = all.filter((item) => item.status === "Doing").length;
  const important = all.filter((item) => item.status === "Quan trọng").length;

  const lines = [];

  if (currentLang === "vi") {
    if (stats.balance < 0) {
      lines.push(`KH2 đang âm ${formatMoney(Math.abs(stats.balance))}, nên ưu tiên bù quỹ.`);
    } else {
      lines.push(`KH2 đang dương ${formatMoney(stats.balance)}, tình hình ổn.`);
    }

    if (due.length) lines.push(`Có ${due.length} mục gần hạn, nên xử lý trước.`);
    if (important > 0) lines.push(`Có ${important} mục quan trọng đang cần chú ý.`);
    if (doing > 6) lines.push("Bạn đang mở khá nhiều việc Doing, nên đóng bớt task trước khi thêm mới.");
    if (!lines.length) lines.push("Hệ thống đang ổn. Có thể thêm mục tiêu mới hoặc cập nhật dữ liệu KH2 hôm nay.");
  } else {
    if (stats.balance < 0) {
      lines.push(`KH2 is negative by ${formatMoney(Math.abs(stats.balance))}. Prioritize refunding the fund.`);
    } else {
      lines.push(`KH2 is positive by ${formatMoney(stats.balance)}. Everything looks stable.`);
    }

    if (due.length) lines.push(`${due.length} items are due soon. Handle them first.`);
    if (important > 0) lines.push(`${important} important items need attention.`);
    if (doing > 6) lines.push("You have many Doing items. Finish some before adding more.");
    if (!lines.length) lines.push("Everything looks good. Add a new goal or update today's KH2 record.");
  }

  return lines;
}

/* =========================
   RENDER CORE
========================= */

function renderDashboard() {
  const stats = getKh2Stats();
  const allItems = filterItems(getAllItems());
  const doneItems = allItems.filter((item) => item.status === "Xong").length;
  const importantItems = allItems.filter((item) => item.status === "Quan trọng").length;
  const dueItems = getDueItems(3);
  const advice = getAssistantAdvice();

  content.innerHTML = `
    <div class="grid">
      <div class="card hero">
        <h2>${t("heroTitle")}</h2>
        <p>${t("heroDesc")}</p>
      </div>

      <div class="grid grid-4">
        <div class="card">
          <h3>${t("totalItems")}</h3>
          <p class="big">${allItems.length}</p>
          <p class="muted">${t("totalSystem")}</p>
        </div>

        <div class="card">
          <h3>${t("completed")}</h3>
          <p class="big">${doneItems}</p>
          <p class="muted">${t("completedDesc")}</p>
        </div>

        <div class="card">
          <h3>${t("important")}</h3>
          <p class="big">${importantItems}</p>
          <p class="muted">${t("importantDesc")}</p>
        </div>

        <div class="card">
          <h3>${t("kh2Balance")}</h3>
          <p class="big ${stats.balance < 0 ? "danger-text" : "success-text"}">
            ${formatMoney(stats.balance)}
          </p>
          <p class="muted">${t("balanceDesc")}</p>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("assistant")}</h3>
          <div class="list">
            ${advice.map((line) => `<div class="mini-note">${escapeHTML(line)}</div>`).join("")}
          </div>
        </div>

        <div class="card">
          <h3>${t("dueTitle")}</h3>
          <div class="list">
            ${
              dueItems.length
                ? dueItems.slice(0, 5).map(renderItem).join("")
                : `<p class="muted">${t("noDue")}</p>`
            }
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>${t("recentPlans")}</h3>
            <p class="muted">${t("recentPlansDesc")}</p>
          </div>

          <button class="primary-btn" onclick="openAddModal('kh1')">
            ${t("addPlan")}
          </button>
        </div>

        <div class="list">
          ${
            allItems.length
              ? allItems.slice(-12).reverse().map(renderItem).join("")
              : `<p class="muted">${t("emptyPlans")}</p>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderKhPage(key) {
  if (key === "kh2") {
    renderKh2();
    return;
  }

  const info = pageInfo[key];
  const items = filterItems(
    appData[key].map((item) => ({ ...item, group: key })),
  );

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero">
        <h2>${info.icon} ${t(key)}</h2>
        <p>${t(info.descKey)}</p>
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
          ${
            items.length
              ? items.map(renderItem).join("")
              : `<p class="muted">${t("emptyInGroup")} ${key.toUpperCase()}.</p>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderKh2() {
  const stats = getKh2Stats();

  content.innerHTML = `
    <div class="grid">
      <div class="grid grid-4">
        <div class="card">
          <h3>${t("kh2PassDays")}</h3>
          <p class="big">${stats.passDays}</p>
          <p class="muted">${t("kh2PassDaysDesc")}</p>
        </div>

        <div class="card">
          <h3>${t("kh2TotalSaved")}</h3>
          <p class="big">${formatMoney(stats.totalSaved)}</p>
          <p class="muted">${t("kh2TotalSavedDesc")}</p>
        </div>

        <div class="card">
          <h3>${t("kh2TotalWithdraw")}</h3>
          <p class="big">${formatMoney(stats.totalWithdraw)}</p>
          <p class="muted">${t("kh2TotalWithdrawDesc")}</p>
        </div>

        <div class="card">
          <h3>${t("kh2FundBalance")}</h3>
          <p class="big ${stats.balance < 0 ? "danger-text" : "success-text"}">
            ${formatMoney(stats.balance)}
          </p>
          <p class="muted">${t("balanceDesc")}</p>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card form-card">
          <h3>${t("chooseDate")}</h3>

          <label>
            ${t("dateToEdit")}
            <input type="date" id="kh2DateInput" />
          </label>

          <div class="checkbox-row">
            <input type="checkbox" id="kh2SavedInput" />
            <div>
              <strong>${t("added15k")}</strong>
              <p class="muted">${t("tickPass")}</p>
            </div>
          </div>

          <label>
            ${t("withdrawAmount")}
            <input type="number" id="kh2WithdrawInput" min="0" placeholder="VD: 50000" />
          </label>

          <label>
            ${t("note")}
            <textarea id="kh2NoteInput" placeholder="VD: ăn uống, đi học, mua đồ..."></textarea>
          </label>

          <div class="modal-actions">
            <button class="ghost-btn" id="kh2DeleteDayBtn">${t("deleteThisDay")}</button>
            <button class="primary-btn" id="kh2SaveDayBtn">${t("saveThisDay")}</button>
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
          <div>
            <h3>${t("kh2PrivateNotes")}</h3>
            <p class="muted">${t("kh2PrivateDesc")}</p>
          </div>

          <button class="primary-btn" onclick="openAddModal('kh2')">
            ${t("addKh2")}
          </button>
        </div>

        <div class="list">
          ${
            appData.kh2.length
              ? filterItems(appData.kh2.map((item) => ({ ...item, group: "kh2" })))
                  .map(renderItem)
                  .join("")
              : `<p class="muted">${t("kh2Empty")}</p>`
          }
        </div>
      </div>

      <div class="card">
        <h3>${t("history")}</h3>
        <div class="list">${renderKh2History()}</div>
      </div>
    </div>
  `;

  initKh2Form();
}

function renderKh2Heatmap() {
  const cells = [];
  const now = new Date(today());

  for (let i = 59; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const key = date.toISOString().slice(0, 10);
    const record = appData.kh2Daily[key];

    let cls = "heat-cell empty-cell";
    let title = `${key}: ${t("notRecorded")}`;

    if (record) {
      if (record.saved) {
        cls = "heat-cell pass-cell";
        title = `${key}: ${t("pass")}, ${t("withdrawn")} ${formatMoney(record.withdraw || 0)}`;
      } else {
        cls = "heat-cell fail-cell";
        title = `${key}: ${t("notPass")}, ${t("withdrawn")} ${formatMoney(record.withdraw || 0)}`;
      }
    }

    cells.push(`<span class="${cls}" title="${escapeHTML(title)}"></span>`);
  }

  return cells.join("");
}

function renderKh2History() {
  const entries = Object.entries(appData.kh2Daily || {}).sort((a, b) =>
    b[0].localeCompare(a[0]),
  );

  if (!entries.length) {
    return `<p class="muted">${t("noHistory")}</p>`;
  }

  return entries
    .map(
      ([date, record]) => `
    <div class="item">
      <div>
        <strong>${escapeHTML(date)}</strong>
        <p class="muted">
          ${t("withdrawn")}: ${formatMoney(record.withdraw || 0)}
          ${record.note ? "• " + escapeHTML(record.note) : ""}
        </p>
      </div>

      <span class="badge ${record.saved ? "green" : "red"}">
        ${record.saved ? t("pass") : t("notPass")}
      </span>
    </div>
  `,
    )
    .join("");
}

/* =========================
   EXTRA PAGES
========================= */

function renderCalendar() {
  const items = filterItems(getAllItems())
    .filter((item) => item.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero">
        <h2>📅 ${t("calendar")}</h2>
        <p>${t("calendarDesc")}</p>
      </div>

      <div class="card">
        <div class="list">
          ${
            items.length
              ? items
                  .map(
                    (item) => `
                <div class="timeline-item">
                  <div class="timeline-date">${formatDate(item.date)}</div>
                  ${renderItem(item)}
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
  const columns = [
    { key: "Todo", title: "Todo" },
    { key: "Doing", title: "Doing" },
    { key: "Quan trọng", title: currentLang === "vi" ? "Quan trọng" : "Important" },
    { key: "Xong", title: currentLang === "vi" ? "Xong" : "Done" },
  ];

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero">
        <h2>🧲 ${t("kanban")}</h2>
        <p>${t("kanbanDesc")}</p>
      </div>

      <div class="kanban">
        ${columns
          .map((column) => {
            const colItems = items.filter(
              (item) => (item.status || "Todo") === column.key,
            );

            return `
            <div class="kanban-col">
              <h3>${column.title} <span>${colItems.length}</span></h3>
              <div class="list">
                ${
                  colItems.length
                    ? colItems.map(renderKanbanCard).join("")
                    : `<p class="muted">${t("empty")}</p>`
                }
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
  const stats = getKh2Stats();
  const achievements = getAchievements();
  const byGroup = getGroupKeys().map((key) => ({
    key,
    count: appData[key].length,
  }));

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero">
        <h2>📊 ${t("insights")}</h2>
        <p>${t("insightsDesc")}</p>
      </div>

      <div class="grid grid-4">
        <div class="card"><h3>${t("totalItems")}</h3><p class="big">${all.length}</p><p class="muted">${t("totalSystem")}</p></div>
        <div class="card"><h3>${t("passKh2")}</h3><p class="big">${stats.passDays}</p><p class="muted">${t("passKh2Desc")}</p></div>
        <div class="card"><h3>${t("kh2TotalSaved")}</h3><p class="big">${formatMoney(stats.totalSaved)}</p><p class="muted">${t("totalKh2")}</p></div>
        <div class="card"><h3>${t("kh2TotalWithdraw")}</h3><p class="big">${formatMoney(stats.totalWithdraw)}</p><p class="muted">${t("totalKh2")}</p></div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("groupDistribution")}</h3>
          <div class="list">
            ${byGroup
              .map(
                (g) => `
              <div class="stat-row">
                <span>${g.key.toUpperCase()}</span>
                <strong>${g.count}</strong>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="card">
          <h3>🏆 Achievements</h3>
          <div class="achievement-grid">
            ${achievements
              .map(
                (a) => `
              <div class="achievement ${a.unlocked ? "unlocked" : ""}">
                <span>${a.icon}</span>
                <strong>${escapeHTML(a.title)}</strong>
                <p>${escapeHTML(a.desc)}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="card">
        <h3>${t("activityLog")}</h3>
        <div class="list">
          ${
            appData.activityLog.length
              ? appData.activityLog
                  .slice(0, 20)
                  .map(
                    (log) => `
                <div class="item">
                  <div>
                    <strong>${escapeHTML(log.action)}</strong>
                    <p class="muted">${escapeHTML(log.detail)} • ${new Date(log.at).toLocaleString("vi-VN")}</p>
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
  `;
}

function renderSettings() {
  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero">
        <h2>⚙️ ${t("settings")}</h2>
        <p>${t("toolsDesc")}</p>
      </div>

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

/* =========================
   KH2 FORM
========================= */

function initKh2Form() {
  const dateInput = $("kh2DateInput");
  const savedInput = $("kh2SavedInput");
  const withdrawInput = $("kh2WithdrawInput");
  const noteInput = $("kh2NoteInput");
  const saveBtn = $("kh2SaveDayBtn");
  const deleteBtn = $("kh2DeleteDayBtn");

  function renderSelected() {
    const date = dateInput.value;
    const record = appData.kh2Daily[date] || {
      saved: false,
      withdraw: 0,
      note: "",
    };

    savedInput.checked = Boolean(record.saved);
    withdrawInput.value = record.withdraw || "";
    noteInput.value = record.note || "";

    $("kh2SelectedDate").textContent = date || "--";

    const selectedSaved = $("kh2SelectedSaved");
    selectedSaved.textContent = record.saved
      ? currentLang === "vi" ? "Đã thêm 15K ✅" : "Added 15K ✅"
      : currentLang === "vi" ? "Chưa thêm ❌" : "Not added ❌";
    selectedSaved.className = record.saved ? "success-text" : "danger-text";

    $("kh2SelectedWithdraw").textContent = formatMoney(record.withdraw || 0);
    $("kh2SelectedNote").textContent = record.note || t("noNote");
  }

  dateInput.value = today();
  renderSelected();

  dateInput.addEventListener("change", renderSelected);

  saveBtn.addEventListener("click", () => {
    const date = dateInput.value;
    if (!date) return showToast(currentLang === "vi" ? "Bạn chưa chọn ngày 😭" : "Please choose a date 😭");

    const withdraw = Number(withdrawInput.value || 0);
    if (withdraw < 0) return showToast(currentLang === "vi" ? "Số tiền rút không được âm 😭" : "Withdrawal cannot be negative 😭");

    appData.kh2Daily[date] = {
      saved: savedInput.checked,
      withdraw,
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

    if (!appData.kh2Daily[date])
      return showToast(currentLang === "vi" ? "Ngày này chưa có dữ liệu 😭" : "This day has no data 😭");

    if (!confirm(currentLang === "vi" ? "Bạn chắc chắn muốn xóa dữ liệu ngày này?" : "Delete this day record?")) return;

    delete appData.kh2Daily[date];

    addActivity(currentLang === "vi" ? "Xóa dữ liệu KH2" : "Delete KH2 record", `${t("day")} ${date}`);
    saveAll();
    renderKh2();
    showToast(currentLang === "vi" ? "Đã xóa ngày này 🗑" : "Day deleted 🗑");
  });
}

/* =========================
   CRUD
========================= */

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
          ${item.date ? " • " + formatDate(item.date) : ""}
          ${dueText}
          ${item.note ? " • " + escapeHTML(item.note) : ""}
        </p>
      </div>

      <div class="item-actions">
        <span class="badge ${badgeClass(item.status)}">${escapeHTML(item.status || "Todo")}</span>
        <button class="mini-btn" onclick="openEditModal('${group}', '${item.id}')">${t("edit")}</button>
        <button class="mini-btn danger" onclick="deleteItem('${group}', '${item.id}')">${t("delete")}</button>
      </div>
    </div>
  `;
}

function openAddModal(type = currentPage === "dashboard" ? "kh1" : currentPage) {
  if (!getGroupKeys().includes(type)) type = "kh1";

  editId.value = "";
  modalMode.textContent = t("modalNew");
  modalTitle.textContent = t("modalAddTitle");

  planType.value = type;
  planName.value = "";
  planDate.value = "";
  planStatus.value = "Todo";
  planNote.value = "";

  planModal.classList.add("show");
  planName.focus();
}

function openEditModal(type, id) {
  const item = appData[type]?.find((x) => x.id === id);

  if (!item) return showToast(currentLang === "vi" ? "Không tìm thấy mục cần sửa 😭" : "Item not found 😭");

  editId.value = id;
  modalMode.textContent = t("modalEdit");
  modalTitle.textContent = t("modalEditTitle");

  planType.value = type;
  planName.value = item.name || "";
  planDate.value = item.date || "";
  planStatus.value = item.status || "Todo";
  planNote.value = item.note || "";

  planModal.classList.add("show");
  planName.focus();
}

function closeModal() {
  planModal.classList.remove("show");
  planForm.reset();
  editId.value = "";
}

function deleteItem(type, id) {
  if (!confirm(currentLang === "vi" ? "Bạn chắc chắn muốn xóa mục này?" : "Are you sure you want to delete this item?")) return;

  const item = appData[type]?.find((x) => x.id === id);
  appData[type] = appData[type].filter((x) => x.id !== id);

  addActivity(currentLang === "vi" ? "Xóa kế hoạch" : "Delete plan", `${type.toUpperCase()} • ${item?.name || id}`);
  saveAll();
  loadPage(currentPage);
  showToast(currentLang === "vi" ? "Đã xóa 🗑" : "Deleted 🗑");
}

function moveItem(type, id, status) {
  appData[type] = appData[type].map((item) =>
    item.id === id
      ? { ...item, status, updatedAt: new Date().toISOString() }
      : item,
  );

  addActivity(currentLang === "vi" ? "Đổi trạng thái" : "Change status", `${type.toUpperCase()} → ${status}`);
  saveAll();
  loadPage(currentPage);
  showToast(currentLang === "vi" ? "Đã đổi trạng thái ✅" : "Status changed ✅");
}

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;
window.moveItem = moveItem;

planForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const type = planType.value;
  const id = editId.value;
  const name = planName.value.trim();

  if (!name) return showToast(currentLang === "vi" ? "Bạn chưa nhập tiêu đề 😭" : "Please enter a title 😭");

  const payload = {
    id: id || uid(),
    name,
    date: planDate.value,
    status: planStatus.value,
    note: planNote.value.trim(),
    updatedAt: new Date().toISOString(),
  };

  if (id) {
    appData[type] = appData[type].map((item) =>
      item.id === id ? { ...item, ...payload } : item,
    );

    addActivity(currentLang === "vi" ? "Sửa kế hoạch" : "Edit plan", `${type.toUpperCase()} • ${name}`);
    showToast(currentLang === "vi" ? "Đã sửa kế hoạch ✅" : "Plan updated ✅");
  } else {
    appData[type].push({
      ...payload,
      createdAt: new Date().toISOString(),
    });

    addActivity(currentLang === "vi" ? "Thêm kế hoạch" : "Add plan", `${type.toUpperCase()} • ${name}`);
    showToast(currentLang === "vi" ? "Đã thêm kế hoạch ✅" : "Plan added ✅");
  }

  saveAll();
  closeModal();
  loadPage(currentPage);
});

/* =========================
   TOOLS
========================= */

function exportData() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `planos-backup-${today()}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showToast(currentLang === "vi" ? "Đã export JSON 📤" : "JSON exported 📤");
}

function triggerImport() {
  importFileInput.click();
}

importFileInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    appData = normalizeData(data);
    addActivity(currentLang === "vi" ? "Import dữ liệu" : "Import data", file.name);
    saveAll(true);
    loadPage(currentPage);

    showToast(currentLang === "vi" ? "Import thành công 📥" : "Import successful 📥");
  } catch {
    showToast(currentLang === "vi" ? "File JSON không hợp lệ 😭" : "Invalid JSON file 😭");
  } finally {
    importFileInput.value = "";
  }
});

async function requestNotifications() {
  if (!("Notification" in window)) {
    showToast(currentLang === "vi" ? "Trình duyệt không hỗ trợ notification 😭" : "Browser does not support notifications 😭");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    showToast(currentLang === "vi" ? "Đã bật thông báo 🔔" : "Notifications enabled 🔔");
    notifyDueItems();
  } else {
    showToast(currentLang === "vi" ? "Bạn chưa cấp quyền thông báo 😭" : "Notification permission denied 😭");
  }
}

function notifyDueItems() {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;

  const due = getDueItems(1);

  if (!due.length) {
    new Notification("PlanOS", {
      body: currentLang === "vi" ? "Không có deadline gấp hôm nay. Good job 😎" : "No urgent deadlines today. Good job 😎",
    });
    return;
  }

  new Notification("PlanOS", {
    body: currentLang === "vi"
      ? `Bạn có ${due.length} mục cần chú ý hôm nay/ngày mai.`
      : `You have ${due.length} urgent items today/tomorrow.`,
  });
}

function manualSave() {
  saveCloud(true);
}

function manualLoad() {
  loadCloud(true);
}

window.exportData = exportData;
window.triggerImport = triggerImport;
window.requestNotifications = requestNotifications;
window.manualSave = manualSave;
window.manualLoad = manualLoad;

/* =========================
   NAVIGATION
========================= */

function loadPage(pageName) {
  if (!pageInfo[pageName]) pageName = "dashboard";

  currentPage = pageName;
  pageTitle.textContent = t(pageName);

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  if (sideStatus) {
    const stats = getKh2Stats();
    sideStatus.textContent = stats.balance < 0 ? t("sideWarning") : t("sideOk");
  }

  if (pageName === "dashboard") renderDashboard();
  else if (pageName === "calendar") renderCalendar();
  else if (pageName === "kanban") renderKanban();
  else if (pageName === "insights") renderInsights();
  else if (pageName === "settings") renderSettings();
  else renderKhPage(pageName);

  applyLanguage();
}

/* =========================
   EVENTS
========================= */

navItems.forEach((item) => {
  item.addEventListener("click", () => loadPage(item.dataset.page));
});

globalSearch?.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  loadPage(currentPage);
});

langBtn?.addEventListener("click", () => {
  currentLang = currentLang === "vi" ? "en" : "vi";
  localStorage.setItem(LANG_KEY, currentLang);
  loadPage(currentPage);
});

themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");

  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  themeBtn.textContent = isLight ? "☀️" : "🌙";
});

addPlanBtn?.addEventListener("click", () => openAddModal());
closeModalBtn?.addEventListener("click", closeModal);
cancelModalBtn?.addEventListener("click", closeModal);

planModal?.addEventListener("click", (event) => {
  if (event.target === planModal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && planModal?.classList.contains("show")) {
    closeModal();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    globalSearch?.focus();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
    event.preventDefault();
    openAddModal();
  }
});

cloudSaveBtn?.addEventListener("click", () => saveCloud(true));
cloudLoadBtn?.addEventListener("click", () => loadCloud(true));
notifyBtn?.addEventListener("click", requestNotifications);

/* =========================
   INIT
========================= */

async function initApp() {
  checkLogin();

  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light") {
    document.body.classList.add("light");
    if (themeBtn) themeBtn.textContent = "☀️";
  }

  const loaded = await loadCloud(false);

  if (!loaded) {
    saveLocal();
  }

  loadPage("dashboard");

  setTimeout(() => {
    notifyDueItems();
  }, 1200);
}

initApp();