import { saveDataToCloud, loadDataFromCloud } from "./firebase.js";

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
let pendingCloudSave = false;
let lastSaveAt = 0;
const SAVE_DELAY = 450;


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
    sideOk: "Sẵn sàng làm việc 🔥",
    sideWarning: "KH2 cần bù quỹ ⚠️",

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

    cloudSaved: "Đã lưu cloud ☁️",
    cloudLoaded: "Đã tải cloud 🔄",
    cloudEmpty: "Cloud chưa có dữ liệu 😭",
    cloudError: "Lỗi cloud 😭",
    loginSuccess: "Đăng nhập thành công 🔐",
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
    sideOk: "Ready to work 🔥",
    sideWarning: "KH2 needs refund ⚠️",

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

    calendarDesc:
      "View all deadlines, installment dates and study plans by date.",
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

    cloudSaved: "Cloud saved ☁️",
    cloudLoaded: "Cloud loaded 🔄",
    cloudEmpty: "No cloud data yet 😭",
    cloudError: "Cloud error 😭",
    loginSuccess: "Login successful 🔐",
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
  if (cancelModalBtn) cancelModalBtn.textContent = t("cancel");
  if ($("modalSaveBtn")) $("modalSaveBtn").textContent = t("formSave");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const old = el.textContent.trim();
    const icon = old.match(/^[^\p{L}\p{N}]+/u)?.[0]?.trim();
    el.textContent = icon ? `${icon} ${t(key)}` : t(key);
  });
}

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

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

async function saveCloud(showMessage = false) {
  if (isCloudSaving) {
    pendingCloudSave = true;
    return;
  }

  isCloudSaving = true;
  pendingCloudSave = false;

  try {
    const payload = {
      ...appData,
      savedAt: new Date().toISOString(),
      version: Date.now()
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

    if (pendingCloudSave) {
      pendingCloudSave = false;
      setTimeout(() => saveCloud(false), 250);
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

  saveTimer = setTimeout(() => {
    saveCloud(false);
  }, SAVE_DELAY);
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
    console.error(error);
    if (showMessage) showToast(t("cloudError"));
    return false;
  }
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
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
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
  return Math.ceil((target - now) / 86400000);
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

function getKh2Stats() {
  const records = Object.values(appData.kh2Daily || {});
  const passDays = records.filter((d) => d.saved).length;
  const totalSaved = passDays * DAILY_SAVING;
  const totalWithdraw = records.reduce(
    (sum, d) => sum + Number(d.withdraw || 0),
    0,
  );

  return {
    passDays,
    totalSaved,
    totalWithdraw,
    balance: totalSaved - totalWithdraw,
  };
}

function getAssistantAdvice() {
  const stats = getKh2Stats();
  const due = getDueItems(3);
  const important = getAllItems().filter(
    (i) => i.status === "Quan trọng",
  ).length;

  if (currentLang === "en") {
    const arr = [
      stats.balance < 0
        ? `KH2 is negative by ${formatMoney(Math.abs(stats.balance))}.`
        : `KH2 is positive by ${formatMoney(stats.balance)}. Everything looks stable.`,
    ];
    if (due.length) arr.push(`${due.length} items are due soon.`);
    if (important) arr.push(`${important} important items need attention.`);
    return arr;
  }

  const arr = [
    stats.balance < 0
      ? `KH2 đang âm ${formatMoney(Math.abs(stats.balance))}, nên ưu tiên bù quỹ.`
      : `KH2 đang dương ${formatMoney(stats.balance)}, tình hình ổn.`,
  ];
  if (due.length) arr.push(`Có ${due.length} mục gần hạn, nên xử lý trước.`);
  if (important) arr.push(`Có ${important} mục quan trọng đang cần chú ý.`);
  return arr;
}

function checkLogin() {
  const ok = sessionStorage.getItem(LOGIN_KEY) === "true";
  if (ok && loginScreen) loginScreen.classList.add("hide");
}

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  if (
    loginUsername.value.trim() === LOGIN_USERNAME &&
    loginPassword.value.trim() === LOGIN_PASSWORD
  ) {
    sessionStorage.setItem(LOGIN_KEY, "true");
    loginScreen.classList.add("hide");
    loginError.classList.remove("show");
    showToast(t("loginSuccess"));
    return;
  }

  loginError.classList.add("show");
  loginPassword.value = "";
});

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem(LOGIN_KEY);
  location.reload();
});

function renderDashboard() {
  const stats = getKh2Stats();
  const allItems = filterItems(getAllItems());
  const done = allItems.filter((i) => i.status === "Xong").length;
  const important = allItems.filter((i) => i.status === "Quan trọng").length;
  const due = getDueItems(3);
  const advice = getAssistantAdvice();

  content.innerHTML = `
    <div class="grid">
      <div class="card hero">
        <h2>${t("heroTitle")}</h2>
        <p>${t("heroDesc")}</p>
      </div>

      <div class="grid grid-4">
        <div class="card"><h3>${t("totalItems")}</h3><p class="big">${allItems.length}</p><p class="muted">${t("totalSystem")}</p></div>
        <div class="card"><h3>${t("completed")}</h3><p class="big">${done}</p><p class="muted">${t("completedDesc")}</p></div>
        <div class="card"><h3>${t("important")}</h3><p class="big">${important}</p><p class="muted">${t("importantDesc")}</p></div>
        <div class="card"><h3>${t("kh2Balance")}</h3><p class="big ${stats.balance < 0 ? "danger-text" : "success-text"}">${formatMoney(stats.balance)}</p><p class="muted">${t("balanceDesc")}</p></div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3>${t("assistant")}</h3>
          <div class="list">${advice.map((x) => `<div class="mini-note">${escapeHTML(x)}</div>`).join("")}</div>
        </div>

        <div class="card">
          <h3>${t("dueTitle")}</h3>
          <div class="list">${due.length ? due.slice(0, 5).map(renderItem).join("") : `<p class="muted">${t("noDue")}</p>`}</div>
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>${t("recentPlans")}</h3>
            <p class="muted">${t("recentPlansDesc")}</p>
          </div>
          <button class="primary-btn" onclick="openAddModal('kh1')">${t("addPlan")}</button>
        </div>

        <div class="list">${allItems.length ? allItems.slice(-12).reverse().map(renderItem).join("") : `<p class="muted">${t("emptyPlans")}</p>`}</div>
      </div>
    </div>
  `;
}

function renderKhPage(key) {
  if (key === "kh2") return renderKh2();

  const items = filterItems(
    appData[key].map((item) => ({ ...item, group: key })),
  );

  content.innerHTML = `
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
          <button class="primary-btn" onclick="openAddModal('${key}')">${t("addTo")} ${key.toUpperCase()}</button>
        </div>

        <div class="list">${items.length ? items.map(renderItem).join("") : `<p class="muted">${t("emptyInGroup")} ${key.toUpperCase()}.</p>`}</div>
      </div>
    </div>
  `;
}

function renderKh2() {
  const s = getKh2Stats();

  content.innerHTML = `
    <div class="grid">
      <div class="grid grid-4">
        <div class="card"><h3>${t("passDays")}</h3><p class="big">${s.passDays}</p><p class="muted">${t("passDaysDesc")}</p></div>
        <div class="card"><h3>${t("totalSaved")}</h3><p class="big">${formatMoney(s.totalSaved)}</p><p class="muted">${t("totalSavedDesc")}</p></div>
        <div class="card"><h3>${t("totalWithdraw")}</h3><p class="big">${formatMoney(s.totalWithdraw)}</p><p class="muted">${t("totalWithdrawDesc")}</p></div>
        <div class="card"><h3>${t("fundBalance")}</h3><p class="big ${s.balance < 0 ? "danger-text" : "success-text"}">${formatMoney(s.balance)}</p><p class="muted">${t("balanceDesc")}</p></div>
      </div>

      <div class="grid grid-2">
        <div class="card form-card">
          <h3>${t("chooseDate")}</h3>

          <label>${t("dateToEdit")}<input type="date" id="kh2DateInput" /></label>

          <div class="checkbox-row">
            <input type="checkbox" id="kh2SavedInput" />
            <div><strong>${t("added15k")}</strong><p class="muted">${t("tickPass")}</p></div>
          </div>

          <label>${t("withdrawAmount")}<input type="number" id="kh2WithdrawInput" min="0" /></label>
          <label>${t("note")}<textarea id="kh2NoteInput"></textarea></label>

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
          <div><h3>${t("kh2PrivateNotes")}</h3><p class="muted">${t("kh2PrivateDesc")}</p></div>
          <button class="primary-btn" onclick="openAddModal('kh2')">${t("addKh2")}</button>
        </div>
        <div class="list">${appData.kh2.length ? appData.kh2.map((i) => renderItem({ ...i, group: "kh2" })).join("") : `<p class="muted">${t("kh2Empty")}</p>`}</div>
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
  const now = new Date(today());

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    const key = d.toISOString().slice(0, 10);
    const record = appData.kh2Daily[key];

    let cls = "heat-cell empty-cell";
    if (record?.saved) cls = "heat-cell pass-cell";
    if (record && !record.saved) cls = "heat-cell fail-cell";

    cells.push(`
      <button
        type="button"
        class="${cls}"
        title="${key}"
        data-date="${key}"
      ></button>
    `);
  }

  return cells.join("");
}


function selectKh2DateFromHeatmap(date) {
  const dateInput = $("kh2DateInput");

  if (!dateInput) return;

  dateInput.value = date;
  dateInput.dispatchEvent(new Event("change"));

  dateInput.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  dateInput.focus();

  showToast(
    currentLang === "vi"
      ? `Đã chọn ngày ${date}`
      : `Selected ${date}`
  );
}

window.selectKh2DateFromHeatmap = selectKh2DateFromHeatmap;

function renderKh2History() {
  const entries = Object.entries(appData.kh2Daily || {}).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  if (!entries.length) {
    return `<p class="muted">${t("noHistory")}</p>`;
  }

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
      `
    )
    .join("");
}

function deleteKh2HistoryDay(date) {
  const ok = confirm(
    currentLang === "vi"
      ? `Xóa dữ liệu ngày ${date}?`
      : `Delete data of ${date}?`
  );

  if (!ok) return;

  delete appData.kh2Daily[date];

  addActivity(
    currentLang === "vi" ? "Xóa nhanh lịch sử KH2" : "Quick delete KH2 history",
    `${t("day")} ${date}`
  );

  saveAll();
  renderKh2();

  showToast(
    currentLang === "vi"
      ? `Đã xóa ngày ${date}`
      : `Deleted ${date}`
  );
}

window.deleteKh2HistoryDay = deleteKh2HistoryDay;

function renderCalendar() {
  const items = filterItems(getAllItems())
    .filter((i) => i.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero"><h2>📅 ${t("calendar")}</h2><p>${t("calendarDesc")}</p></div>
      <div class="card"><div class="list">${items.length ? items.map((i) => `<div class="timeline-item"><div class="timeline-date">${formatDate(i.date)}</div>${renderItem(i)}</div>`).join("") : `<p class="muted">${t("noDateItems")}</p>`}</div></div>
    </div>
  `;
}

function renderKanban() {
  const items = filterItems(getAllItems());
  const cols = [
    { key: "Todo", title: "Todo" },
    { key: "Doing", title: "Doing" },
    {
      key: "Quan trọng",
      title: currentLang === "vi" ? "Quan trọng" : "Important",
    },
    { key: "Xong", title: currentLang === "vi" ? "Xong" : "Done" },
  ];

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero"><h2>🧲 ${t("kanban")}</h2><p>${t("kanbanDesc")}</p></div>
      <div class="kanban">
        ${cols
          .map((col) => {
            const list = items.filter((i) => (i.status || "Todo") === col.key);
            return `<div class="kanban-col"><h3>${col.title} <span>${list.length}</span></h3><div class="list">${list.length ? list.map(renderKanbanCard).join("") : `<p class="muted">${t("empty")}</p>`}</div></div>`;
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

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero"><h2>📊 ${t("insights")}</h2><p>${t("insightsDesc")}</p></div>

      <div class="grid grid-4">
        <div class="card"><h3>${t("totalItems")}</h3><p class="big">${all.length}</p><p class="muted">${t("totalSystem")}</p></div>
        <div class="card"><h3>${t("passDays")}</h3><p class="big">${s.passDays}</p><p class="muted">${t("passDaysDesc")}</p></div>
        <div class="card"><h3>${t("totalSaved")}</h3><p class="big">${formatMoney(s.totalSaved)}</p><p class="muted">KH2</p></div>
        <div class="card"><h3>${t("totalWithdraw")}</h3><p class="big">${formatMoney(s.totalWithdraw)}</p><p class="muted">KH2</p></div>
      </div>

      <div class="card">
        <h3>${t("activityLog")}</h3>
        <div class="list">
          ${
            appData.activityLog.length
              ? appData.activityLog
                  .slice(0, 20)
                  .map(
                    (log) =>
                      `<div class="item"><div><strong>${escapeHTML(log.action)}</strong><p class="muted">${escapeHTML(log.detail)} • ${new Date(log.at).toLocaleString("vi-VN")}</p></div></div>`,
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
      <div class="card hero small-hero"><h2>⚙️ ${t("settings")}</h2><p>${t("toolsDesc")}</p></div>

      <div class="grid grid-2">
        <div class="card"><h3>${t("exportData")}</h3><p class="muted">${t("exportDesc")}</p><button class="primary-btn" onclick="exportData()">Export JSON</button></div>
        <div class="card"><h3>${t("importData")}</h3><p class="muted">${t("importDesc")}</p><button class="primary-btn" onclick="triggerImport()">Import JSON</button></div>
        <div class="card"><h3>${t("browserNotification")}</h3><p class="muted">${t("notificationDesc")}</p><button class="primary-btn" onclick="requestNotifications()">${t("enableNotification")}</button></div>
        <div class="card"><h3>☁ Firebase</h3><p class="muted">${t("firebaseDesc")}</p><div class="tool-row"><button class="primary-btn" onclick="manualSave()">Save Cloud</button><button class="ghost-btn" onclick="manualLoad()">Load Cloud</button></div></div>
      </div>
    </div>
  `;
}

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
      ? `${t("pass")} ✅`
      : `${t("notPass")} ❌`;
    selectedSaved.className = record.saved ? "success-text" : "danger-text";

    $("kh2SelectedWithdraw").textContent = formatMoney(record.withdraw || 0);
    $("kh2SelectedNote").textContent = record.note || t("noNote");
  }

  dateInput.value = today();
  renderSelected();

  dateInput.addEventListener("change", renderSelected);

  saveBtn.addEventListener("click", () => {
    const date = dateInput.value;
    if (!date)
      return showToast(
        currentLang === "vi" ? "Bạn chưa chọn ngày 😭" : "Choose a date 😭",
      );

    appData.kh2Daily[date] = {
      saved: savedInput.checked,
      withdraw: Number(withdrawInput.value || 0),
      note: noteInput.value.trim(),
      updatedAt: new Date().toISOString(),
    };

    addActivity(
      currentLang === "vi" ? "Cập nhật KH2" : "Update KH2",
      `${t("day")} ${date}`,
    );
    saveAll();
    renderKh2();
    showToast(currentLang === "vi" ? "Đã lưu ngày này ✅" : "Day saved ✅");
  });

  deleteBtn.addEventListener("click", () => {
    const date = dateInput.value;
    if (!appData.kh2Daily[date])
      return showToast(
        currentLang === "vi"
          ? "Ngày này chưa có dữ liệu 😭"
          : "No data for this day 😭",
      );
    if (!confirm(currentLang === "vi" ? "Xóa ngày này?" : "Delete this day?"))
      return;

    delete appData.kh2Daily[date];
    addActivity(
      currentLang === "vi" ? "Xóa dữ liệu KH2" : "Delete KH2 record",
      `${t("day")} ${date}`,
    );
    saveAll();
    renderKh2();
  });
}
function initKh2HeatmapClick() {
  document.querySelectorAll(".heat-cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      const date = cell.dataset.date;
      const dateInput = $("kh2DateInput");

      if (!date || !dateInput) return;

      dateInput.value = date;
      dateInput.dispatchEvent(new Event("change"));

      dateInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      setTimeout(() => {
        dateInput.focus();
      }, 400);

      showToast(
        currentLang === "vi"
          ? `Đã chọn ngày ${date}`
          : `Selected ${date}`
      );
    });
  });
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
        <p class="muted">${group.toUpperCase()} ${item.date ? "• " + formatDate(item.date) : ""}${dueText} ${item.note ? "• " + escapeHTML(item.note) : ""}</p>
      </div>

      <div class="item-actions">
        <span class="badge ${badgeClass(item.status)}">${escapeHTML(item.status || "Todo")}</span>
        <button class="mini-btn" onclick="openEditModal('${group}', '${item.id}')">${t("edit")}</button>
        <button class="mini-btn danger" onclick="deleteItem('${group}', '${item.id}')">${t("delete")}</button>
      </div>
    </div>
  `;
}

function openAddModal(
  type = currentPage === "dashboard" ? "kh1" : currentPage,
) {
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
  if (!item) return;

  editId.value = id;
  modalMode.textContent = t("modalEdit");
  modalTitle.textContent = t("modalEditTitle");
  planType.value = type;
  planName.value = item.name || "";
  planDate.value = item.date || "";
  planStatus.value = item.status || "Todo";
  planNote.value = item.note || "";

  planModal.classList.add("show");
}

function closeModal() {
  planModal.classList.remove("show");
  planForm.reset();
  editId.value = "";
}

function deleteItem(type, id) {
  if (
    !confirm(
      currentLang === "vi" ? "Bạn chắc chắn muốn xóa?" : "Delete this item?",
    )
  )
    return;

  const item = appData[type]?.find((x) => x.id === id);
  appData[type] = appData[type].filter((x) => x.id !== id);

  addActivity(
    currentLang === "vi" ? "Xóa kế hoạch" : "Delete plan",
    `${type.toUpperCase()} • ${item?.name || id}`,
  );
  saveAll();
  loadPage(currentPage);
}

function moveItem(type, id, status) {
  appData[type] = appData[type].map((item) =>
    item.id === id
      ? { ...item, status, updatedAt: new Date().toISOString() }
      : item,
  );

  addActivity(
    currentLang === "vi" ? "Đổi trạng thái" : "Change status",
    `${type.toUpperCase()} → ${status}`,
  );
  saveAll();
  loadPage(currentPage);
}

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;
window.moveItem = moveItem;

planForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = planType.value;
  const id = editId.value;
  const name = planName.value.trim();

  if (!name) return;

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
    addActivity(
      currentLang === "vi" ? "Sửa kế hoạch" : "Edit plan",
      `${type.toUpperCase()} • ${name}`,
    );
  } else {
    appData[type].push({ ...payload, createdAt: new Date().toISOString() });
    addActivity(
      currentLang === "vi" ? "Thêm kế hoạch" : "Add plan",
      `${type.toUpperCase()} • ${name}`,
    );
  }

  saveAll();
  closeModal();
  loadPage(currentPage);
});

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
}

function triggerImport() {
  importFileInput.click();
}

importFileInput?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  appData = normalizeData(JSON.parse(text));
  addActivity(
    currentLang === "vi" ? "Import dữ liệu" : "Import data",
    file.name,
  );
  saveAll(true);
  loadPage(currentPage);
});

async function requestNotifications() {
  if (!("Notification" in window)) return;
  await Notification.requestPermission();
}

function notifyDueItems() {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;

  const due = getDueItems(1);

  new Notification("PlanOS", {
    body: due.length
      ? currentLang === "vi"
        ? `Bạn có ${due.length} mục cần chú ý.`
        : `You have ${due.length} urgent items.`
      : currentLang === "vi"
        ? "Không có deadline gấp hôm nay."
        : "No urgent deadlines today.",
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

function loadPage(pageName) {
  if (!pageInfo[pageName]) pageName = "dashboard";

  currentPage = pageName;
  pageTitle.textContent = t(pageName);

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  if (sideStatus) {
    const s = getKh2Stats();
    sideStatus.textContent = s.balance < 0 ? t("sideWarning") : t("sideOk");
  }

  if (pageName === "dashboard") renderDashboard();
  else if (pageName === "calendar") renderCalendar();
  else if (pageName === "kanban") renderKanban();
  else if (pageName === "insights") renderInsights();
  else if (pageName === "settings") renderSettings();
  else renderKhPage(pageName);

  applyLanguage();
}

navItems.forEach((item) => {
  item.addEventListener("click", () => loadPage(item.dataset.page));
});

globalSearch?.addEventListener("input", (e) => {
  searchQuery = e.target.value;
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

planModal?.addEventListener("click", (e) => {
  if (e.target === planModal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && planModal?.classList.contains("show")) closeModal();

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    globalSearch?.focus();
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
    e.preventDefault();
    openAddModal();
  }
});

cloudSaveBtn?.addEventListener("click", () => saveCloud(true));
cloudLoadBtn?.addEventListener("click", () => loadCloud(true));
notifyBtn?.addEventListener("click", requestNotifications);

async function initApp() {
  checkLogin();

  if (localStorage.getItem(THEME_KEY) === "light") {
    document.body.classList.add("light");
    if (themeBtn) themeBtn.textContent = "☀️";
  }

  const loaded = await loadCloud(false);
  if (!loaded) saveLocal();

  loadPage("dashboard");

  setTimeout(notifyDueItems, 1200);
}
window.addEventListener("beforeunload", () => {
  saveLocal();

  if (saveTimer) {
    clearTimeout(saveTimer);
  }
});

initApp();
