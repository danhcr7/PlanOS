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

  youtubeApiKey: "AIzaSyCHH7kNKZRreseLYOt4Civ4qCbVfcPcWBE",

  storage: {
    data: "planosData",
    login: "planosLoggedIn",
    theme: "planosTheme",
    lang: "planosLang",
    syncMeta: "planosSyncMeta",
    music: "planosMusic",
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
  personalSaving: {
    monthlyGoal: 0,
    lockUntil: "",
    filter: "all",
    transactions: [],
  },
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
    saving: "Tiết kiệm cá nhân",

    kh1Desc: "Môn học, deadline, đồ án, bài tập.",
    kh2Desc: "Theo dõi PASS, rút quỹ, ghi chú từng ngày.",
    kh3Desc: "Không gian mở cho mục tiêu mới.",
    kh4Desc: "Sách muốn mua, đang đọc, đã đọc.",
    kh5Desc: "Theo dõi kỳ góp laptop.",
    kh6Desc: "Theo dõi các kỳ góp MoMo.",
    savingDesc:
      "Quản lý quỹ tiết kiệm riêng: thêm tiền, rút tiền, phân tích và theo dõi dòng tiền.",

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
    lifeScoreDesc:
      "Điểm tổng hợp từ tiến độ, deadline, tài chính và consistency.",
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
    added15k: "Đã thêm tiền vào quỹ",
    tickPass: "Tick nếu ngày này có tiết kiệm.",
    withdrawAmount: "Số tiền rút từ quỹ",
    note: "Ghi chú",
    deleteThisDay: "Xóa ngày này",
    saveThisDay: "Lưu ngày này",
    selectedDayStatus: "Tình trạng ngày đang chọn",
    day: "Ngày",
    added15kQuestion: "Đã tiết kiệm?",
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
    saving: "Personal Saving",

    kh1Desc: "Subjects, deadlines, projects and assignments.",
    kh2Desc: "Track PASS days, withdrawals and daily notes.",
    kh3Desc: "Open space for future goals.",
    kh4Desc: "Books to buy, reading status and wishlist.",
    kh5Desc: "Track laptop installment progress.",
    kh6Desc: "Track MoMo installment payments.",
    savingDesc:
      "Manage a separate saving fund with deposits, withdrawals, analytics and cashflow tracking.",

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
    lifeScoreDesc:
      "Combined score from progress, deadlines, finance and consistency.",
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
  saving: { icon: "💵", desc: "savingDesc" },
  settings: { icon: "⚙️", desc: "toolsDesc" },
});

const $ = (id) => document.getElementById(id);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

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
  planTime: $("planTime"),
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

  musicSearchInput: $("musicSearchInput"),
  musicPlayBtn: $("musicPlayBtn"),
  musicSuggestions: $("musicSuggestions"),
  musicPlayerFrame: $("musicPlayerFrame"),
  musicPlayerShell: document.querySelector(".music-player-shell"),
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
  syncStatus: "idle",
  dirtyVersion: 0,
  lastSavedVersion: 0,
  cloudUpdatedAt: "",
  lastCloudLoadAt: 0,
  syncRetryCount: 0,
  backgroundSyncTimer: null,
  clickEffectsReady: false,
  analyticsCache: null,
  analyticsCacheVersion: -1,

  musicQuery: "",
  musicResults: [],
  musicSelected: null,
  musicIsPlaying: false,
  musicSearchTimer: null,
  playerDragging: false,
  playerOffsetX: 0,
  playerOffsetY: 0,
};

const store = {
  data: normalizeData(),
  version: 0,
};
/* =========================================================
   MUSIC WIDGET
========================================================= */

function loadSavedMusic() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.storage.music));

    if (!saved?.videoId) return;

    runtime.musicSelected = saved;

    if (dom.musicSearchInput) {
      dom.musicSearchInput.value = saved.title || "";
    }
  } catch (error) {
    console.warn("PlanOS music parse error:", error);
  }
}

function saveSelectedMusic(track) {
  localStorage.setItem(CONFIG.storage.music, JSON.stringify(track));
}

function clearMusicSuggestions() {
  if (!dom.musicSuggestions) return;

  dom.musicSuggestions.innerHTML = "";
  dom.musicSuggestions.classList.remove("show");
}

function renderMusicSuggestions(items = []) {
  if (!dom.musicSuggestions) return;

  if (!items.length) {
    clearMusicSuggestions();
    return;
  }

  dom.musicSuggestions.innerHTML = items
    .map(
      (item) => `
        <button
          class="music-suggestion-item"
          type="button"
          data-action="select-music"
          data-video-id="${escapeAttr(item.videoId)}"
          data-title="${escapeAttr(item.title)}"
          data-channel="${escapeAttr(item.channel)}"
          data-thumb="${escapeAttr(item.thumb)}"
        >
          <img
            class="music-suggestion-thumb"
            src="${escapeAttr(item.thumb)}"
            alt=""
          />

          <span class="music-suggestion-info">
            <strong>${escapeHTML(item.title)}</strong>
            <span>${escapeHTML(item.channel)}</span>
          </span>
        </button>
      `,
    )
    .join("");

  dom.musicSuggestions.classList.add("show");
}

async function searchMusic(query) {
  const q = query.trim();

  if (!q) {
    clearMusicSuggestions();
    return;
  }

  if (
    !CONFIG.youtubeApiKey ||
    CONFIG.youtubeApiKey === "DAN_API_KEY_YOUTUBE_CUA_BAN_VAO_DAY"
  ) {
    renderMusicSuggestions([
      {
        videoId: "jfKfPfyJRdk",
        title: "lofi hip hop radio - beats to relax/study to",
        channel: "Lofi Girl",
        thumb: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
      },
      {
        videoId: "5qap5aO4i9A",
        title: "lofi hip hop radio - beats to sleep/chill to",
        channel: "Lofi Girl",
        thumb: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
      },
    ]);

    showToast("Chưa có YouTube API key, đang dùng dữ liệu demo.");
    return;
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "6",
      q,
      videoCategoryId: "10",
      key: CONFIG.youtubeApiKey,
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("YouTube search failed");
    }

    const data = await response.json();

    const items = (data.items || [])
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet?.title || "Unknown song",
        channel: item.snippet?.channelTitle || "YouTube",
        thumb:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
      }));

    runtime.musicResults = items;
    renderMusicSuggestions(items);
  } catch (error) {
    console.error("Music search error:", error);
    showToast("Không tìm được nhạc 😭");
  }
}

function selectMusic(track) {
  runtime.musicSelected = track;
  runtime.musicIsPlaying = false;

  saveSelectedMusic(track);
  clearMusicSuggestions();

  if (dom.musicSearchInput) {
    dom.musicSearchInput.value = track.title;
  }

  if (dom.musicPlayBtn) {
    dom.musicPlayBtn.textContent = "▶";
  }

  showToast(`Đã chọn: ${track.title}`);
}

function playSelectedMusic() {
  if (!runtime.musicSelected?.videoId) {
    const query = dom.musicSearchInput?.value.trim();

    if (query) {
      searchMusic(query);
      showToast("Chọn một bài trong danh sách gợi ý trước.");
    } else {
      showToast("Nhập tên bài hát trước nha.");
    }

    return;
  }

  const videoId = runtime.musicSelected.videoId;

  if (!runtime.musicIsPlaying) {
    const src =
      `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` +
      `?autoplay=1&controls=1&rel=0&modestbranding=1`;

    dom.musicPlayerFrame.src = src;
    dom.musicPlayerShell?.classList.add("show");

    runtime.musicIsPlaying = true;
    document.querySelector(".music-panel")?.classList.add("playing");
    if (dom.musicPlayBtn) {
      dom.musicPlayBtn.textContent = "⏸";
    }

    return;
  }

  stopMusic();
}

function stopMusic() {
  runtime.musicIsPlaying = false;
  document.querySelector(".music-panel")?.classList.remove("playing");
  if (dom.musicPlayerFrame) {
    dom.musicPlayerFrame.src = "";
  }

  dom.musicPlayerShell?.classList.remove("show");

  if (dom.musicPlayBtn) {
    dom.musicPlayBtn.textContent = "▶";
  }
}

function initMusicWidget() {
  loadSavedMusic();
  document
    .getElementById("musicCloseBtn")
    ?.addEventListener("click", stopMusic);
  document.getElementById("musicMinBtn")?.addEventListener("click", () => {
    const player = document.querySelector(".music-player-shell");

    player.classList.toggle("minimized");
  });
  dom.musicSearchInput?.addEventListener("input", (event) => {
    const query = event.target.value;

    runtime.musicQuery = query;
    runtime.musicSelected = null;

    clearTimeout(runtime.musicSearchTimer);

    runtime.musicSearchTimer = setTimeout(() => {
      searchMusic(query);
    }, 420);
  });

  dom.musicSearchInput?.addEventListener("focus", () => {
    if (runtime.musicResults.length) {
      renderMusicSuggestions(runtime.musicResults);
    }
  });

  dom.musicPlayBtn?.addEventListener("click", playSelectedMusic);

  document.addEventListener("click", (event) => {
    const selectBtn = event.target.closest("[data-action='select-music']");

    if (selectBtn) {
      selectMusic({
        videoId: selectBtn.dataset.videoId,
        title: selectBtn.dataset.title,
        channel: selectBtn.dataset.channel,
        thumb: selectBtn.dataset.thumb,
      });

      return;
    }

    if (!event.target.closest("#musicWidget")) {
      clearMusicSuggestions();
    }
  });
  const player = document.querySelector(".music-player-shell");
  const playerHeader = document.getElementById("musicPlayerHeader");

  playerHeader?.addEventListener("mousedown", (event) => {
    runtime.playerDragging = true;

    const rect = player.getBoundingClientRect();

    runtime.playerOffsetX = event.clientX - rect.left;
    runtime.playerOffsetY = event.clientY - rect.top;

    player.style.right = "auto";
    player.style.bottom = "auto";
  });

  document.addEventListener("mousemove", (event) => {
    if (!runtime.playerDragging) return;

    player.style.left = `${event.clientX - runtime.playerOffsetX}px`;

    player.style.top = `${event.clientY - runtime.playerOffsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    runtime.playerDragging = false;
  });
}
/* =========================================================
   CORE UTILITIES
========================================================= */
function getDailyGreeting() {
  const hour = new Date().getHours();

  let period = "BUỔI SÁNG";
  let title = "Chào buổi sáng, Danh ✨";

  if (hour >= 5 && hour < 11) {
    period = "BUỔI SÁNG";
    title = "Chào buổi sáng, Danh ✨";
  } else if (hour >= 11 && hour < 13) {
    period = "BUỔI TRƯA";
    title = "Chào buổi trưa, Danh ☀️";
  } else if (hour >= 13 && hour < 18) {
    period = "BUỔI CHIỀU";
    title = "Chào buổi chiều, Danh 🌤️";
  } else if (hour >= 18 && hour < 22) {
    period = "BUỔI TỐI";
    title = "Chào buổi tối, Danh 🌙";
  } else {
    period = "ĐÊM MUỘN";
    title = "Đêm rồi, nghỉ ngơi chút nha Danh 🌌";
  }

  const quotes = [
    "Một ngày tốt không cần hoàn hảo, chỉ cần bạn tiến thêm một chút.",
    "Kỷ luật nhỏ mỗi ngày tạo ra phiên bản lớn hơn của chính mình.",
    "Đừng chờ có động lực rồi mới làm. Hãy làm để tạo ra động lực.",
    "Việc hôm nay xử lý gọn, tương lai sẽ nhẹ hơn rất nhiều.",
    "Tập trung vào một việc quan trọng nhất. Xong nó, ngày hôm nay đã thắng.",
    "Người đi chậm nhưng không dừng lại vẫn luôn tiến xa hơn người bỏ cuộc.",
    "Mỗi lần bạn mở PlanOS là một lần bạn chọn kiểm soát cuộc sống của mình.",
    "Không cần hơn ai cả. Chỉ cần tốt hơn chính mình hôm qua.",
    "Deadline không đáng sợ. Đáng sợ là mình không nhìn thẳng vào nó.",
    "Tiền nhỏ, thói quen nhỏ, tiến bộ nhỏ — nhưng cộng lại thành thay đổi lớn.",
    "Một hệ thống tốt sẽ cứu bạn vào những ngày ý chí yếu.",
    "Hôm nay làm ít cũng được, miễn là đừng bỏ trống hoàn toàn.",
  ];

  const quoteIndex = Math.floor(Math.random() * quotes.length);

  return {
    period,
    title,
    quote: quotes[quoteIndex],
  };
}

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
  if (runtime.currentLang === "en" && status === STATUS.important)
    return "Important";
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
  runtime.toastTimer = setTimeout(
    () => dom.toast.classList.remove("show"),
    1900,
  );
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
    time: item.time || "",
    datetime: item.datetime || "",
    status: item.status || STATUS.todo,
    note: item.note || "",
    paid: Boolean(item.paid),
    createdAt: item.createdAt || item.updatedAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeKh2Record(record = {}) {
  const saved = Boolean(record.saved);
  const rawDeposit = Number(record.deposit ?? record.amount ?? 0);

  return {
    saved,
    deposit: saved
      ? Math.max(0, rawDeposit || CONFIG.dailySaving)
      : Math.max(0, rawDeposit || 0),
    withdraw: Math.max(0, Number(record.withdraw || 0)),
    note: record.note || "",
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

function normalizeSavingTransaction(tx = {}) {
  const now = new Date().toISOString();
  const note = tx.note || "";

  return {
    id: tx.id || uid(),
    type: tx.type === "withdraw" ? "withdraw" : "deposit",
    amount: Math.max(0, Number(tx.amount || 0)),
    date: tx.date || today(),
    note,
    category: tx.category || inferSavingCategory(note, tx.type),
    mood: tx.mood || inferSavingMood(note, tx.type, Number(tx.amount || 0)),
    merchant: tx.merchant || "",
    deleted: Boolean(tx.deleted),
    editedAt: tx.editedAt || "",
    originalAmount: tx.originalAmount ?? null,
    createdAt: tx.createdAt || now,
    updatedAt: tx.updatedAt || now,
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
    personalSaving: {
      monthlyGoal: 0,
      lockUntil: "",
      filter: "all",
      transactions: [],
    },
    activityLog: Array.isArray(safe.activityLog) ? safe.activityLog : [],
  };

  GROUPS.forEach((key) => {
    normalized[key] = Array.isArray(safe[key])
      ? safe[key].map(normalizeItem).filter((item) => item.name)
      : [];
  });

  normalized.kh2Daily = Object.fromEntries(
    Object.entries(safe.kh2Daily || safe.kh2Data || {}).map(
      ([date, record]) => [date, normalizeKh2Record(record)],
    ),
  );

  const saving = safe.personalSaving || {};

  normalized.personalSaving = {
    monthlyGoal: Math.max(0, Number(saving.monthlyGoal || 0)),
    lockUntil: saving.lockUntil || "",
    noSpendUntil: saving.noSpendUntil || "",
    noSpendReason: saving.noSpendReason || "",
    filter: saving.filter || "all",
    subscriptions: Array.isArray(saving.subscriptions)
      ? saving.subscriptions
          .filter((sub) => sub && sub.name)
          .map((sub) => ({
            id: sub.id || uid(),
            name: String(sub.name || "").trim(),
            amount: Math.max(0, Number(sub.amount || 0)),
            dueDay: clamp(Number(sub.dueDay || 1), 1, 31),
            note: sub.note || "",
            active: sub.active !== false,
            createdAt: sub.createdAt || new Date().toISOString(),
            updatedAt: sub.updatedAt || new Date().toISOString(),
          }))
      : [],
    missionLog: saving.missionLog || {},
    achievements: saving.achievements || {},
    transactions: Array.isArray(saving.transactions)
      ? saving.transactions.map(normalizeSavingTransaction)
      : [],
  };

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
    return normalizeData(
      JSON.parse(localStorage.getItem(CONFIG.storage.data)) || {},
    );
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

  if (activity) {
    addActivity(activity.action, activity.detail, false);
  }

  invalidateAnalytics();
  saveLocal();

  if (cloud) {
    markDirty();
    scheduleCloudSave();
  }

  if (render) {
    loadPage(runtime.currentPage);
  }

  if (toast) {
    showToast(toast);
  }
}

function addActivity(action, detail, bump = true) {
  store.data.activityLog.unshift({
    id: uid(),
    action,
    detail,
    at: new Date().toISOString(),
  });

  store.data.activityLog = store.data.activityLog.slice(
    0,
    CONFIG.maxActivityLog,
  );
  if (bump) invalidateAnalytics();
}

/* =========================================================
   CLOUD SYNC — LOCAL FIRST + AUTO SAVE + RETRY
========================================================= */

function readSyncMeta() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.storage.syncMeta)) || {};
  } catch (error) {
    console.warn("PlanOS sync meta parse error:", error);
    return {};
  }
}

function writeSyncMeta(patch = {}) {
  const current = readSyncMeta();

  localStorage.setItem(
    CONFIG.storage.syncMeta,
    JSON.stringify({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }),
  );
}

function getCloudDoc(raw) {
  if (!raw) return null;

  if (raw.data && typeof raw.data === "object") {
    return {
      data: raw.data,
      updatedAt:
        raw.updatedAt ||
        raw.updated_at ||
        raw.data.savedAt ||
        raw.data.updatedAt ||
        "",
    };
  }

  return {
    data: raw,
    updatedAt: raw.savedAt || raw.updatedAt || "",
  };
}

function setSyncStatus(status, message = "") {
  runtime.syncStatus = status;

  if (!dom.cloudSaveBtn) return;

  const labels = {
    idle: t("save"),
    pending: "⏳ Pending",
    saving: "☁ Saving...",
    saved: "✅ Saved",
    offline: "📴 Offline",
    error: "⚠ Retry",
  };

  dom.cloudSaveBtn.textContent = labels[status] || t("save");
  dom.cloudSaveBtn.title = message || "";
}

function markDirty() {
  runtime.dirtyVersion += 1;

  writeSyncMeta({
    dirty: true,
    dirtyVersion: runtime.dirtyVersion,
    lastLocalChangeAt: new Date().toISOString(),
  });

  setSyncStatus(navigator.onLine ? "pending" : "offline");
}

function scheduleCloudSave(delay = CONFIG.saveDelay) {
  clearTimeout(runtime.saveTimer);

  if (!navigator.onLine) {
    setSyncStatus(
      "offline",
      "Mất mạng: dữ liệu đã lưu local. Khi online sẽ tự sync.",
    );
    return;
  }

  setSyncStatus("pending");

  runtime.saveTimer = setTimeout(() => {
    saveCloud(false);
  }, delay);
}

function buildCloudPayload() {
  return {
    ...store.data,
    savedAt: new Date().toISOString(),
    appVersion: "PlanOS-2026",
    localVersion: runtime.dirtyVersion,
  };
}

async function saveCloud(showMessage = false) {
  if (!navigator.onLine) {
    setSyncStatus("offline", "Offline: dữ liệu đã lưu local.");
    if (showMessage) showToast("Đang offline, đã lưu local.");
    return false;
  }

  if (runtime.isCloudSaving) {
    runtime.pendingCloudSave = true;
    return false;
  }

  if (runtime.lastSavedVersion === runtime.dirtyVersion && !showMessage) {
    setSyncStatus("saved");
    return true;
  }

  runtime.isCloudSaving = true;
  runtime.pendingCloudSave = false;
  runtime.syncStatus = "saving";
  setSyncStatus("saving");

  if (showMessage) {
    setButtonBusy(dom.cloudSaveBtn, true, t("cloudSaving"));
  }

  const versionToSave = runtime.dirtyVersion;
  const payload = buildCloudPayload();

  try {
    const result = await saveDataToCloud(payload);

    runtime.lastSavedVersion = versionToSave;
    runtime.lastSaveAt = Date.now();
    runtime.cloudUpdatedAt = result?.updatedAt || payload.savedAt;
    runtime.syncRetryCount = 0;

    writeSyncMeta({
      dirty: false,
      dirtyVersion: runtime.dirtyVersion,
      lastSavedVersion: runtime.lastSavedVersion,
      cloudUpdatedAt: runtime.cloudUpdatedAt,
      lastSaveAt: runtime.lastSaveAt,
    });

    setSyncStatus("saved");

    if (showMessage) {
      showToast(t("cloudSaved"));
    }

    return true;
  } catch (error) {
    console.error("Supabase save error:", error);

    runtime.pendingCloudSave = true;
    runtime.syncRetryCount += 1;

    const retryDelay = Math.min(30000, 1000 * 2 ** runtime.syncRetryCount);

    writeSyncMeta({
      dirty: true,
      dirtyVersion: runtime.dirtyVersion,
      lastSaveErrorAt: new Date().toISOString(),
    });

    setSyncStatus(
      "error",
      `Lưu lỗi. Tự thử lại sau ${Math.round(retryDelay / 1000)}s.`,
    );

    setTimeout(() => {
      if (runtime.pendingCloudSave) {
        runtime.pendingCloudSave = false;
        saveCloud(false);
      }
    }, retryDelay);

    if (showMessage) {
      showToast(t("cloudError"));
    }

    return false;
  } finally {
    runtime.isCloudSaving = false;

    if (showMessage) {
      setButtonBusy(dom.cloudSaveBtn, false);
      setSyncStatus(runtime.syncStatus || "idle");
    }

    if (runtime.pendingCloudSave) {
      runtime.pendingCloudSave = false;
      scheduleCloudSave(400);
    }
  }
}

function isCloudNewer(cloudDoc) {
  if (!cloudDoc?.updatedAt) return false;
  if (!runtime.cloudUpdatedAt) return true;

  return (
    new Date(cloudDoc.updatedAt).getTime() >
    new Date(runtime.cloudUpdatedAt).getTime()
  );
}

async function loadCloud(showMessage = false, options = {}) {
  const { force = false } = options;

  if (!navigator.onLine) {
    if (showMessage) showToast("Đang offline, không tải được cloud.");
    return false;
  }

  if (showMessage) {
    setButtonBusy(
      dom.cloudLoadBtn,
      true,
      runtime.currentLang === "vi" ? "Đang tải..." : "Loading...",
    );
  }

  try {
    const cloudDoc = getCloudDoc(await loadDataFromCloud());

    if (!cloudDoc?.data) {
      if (showMessage) showToast(t("cloudEmpty"));
      return false;
    }

    const localHasUnsavedChanges =
      runtime.dirtyVersion !== runtime.lastSavedVersion;

    if (localHasUnsavedChanges && !force) {
      const ok = confirm(
        "Bạn đang có dữ liệu local chưa sync. Tải cloud có thể ghi đè dữ liệu hiện tại. Vẫn tải cloud?",
      );

      if (!ok) return false;
    }

    store.data = normalizeData(cloudDoc.data);
    runtime.cloudUpdatedAt = cloudDoc.updatedAt || cloudDoc.data.savedAt || "";
    runtime.lastCloudLoadAt = Date.now();
    runtime.dirtyVersion += 1;
    runtime.lastSavedVersion = runtime.dirtyVersion;

    writeSyncMeta({
      dirty: false,
      dirtyVersion: runtime.dirtyVersion,
      lastSavedVersion: runtime.lastSavedVersion,
      cloudUpdatedAt: runtime.cloudUpdatedAt,
      lastCloudLoadAt: runtime.lastCloudLoadAt,
    });

    invalidateAnalytics();
    saveLocal();
    loadPage(runtime.currentPage);
    setSyncStatus("saved");

    if (showMessage) showToast(t("cloudLoaded"));

    return true;
  } catch (error) {
    console.error("Supabase load error:", error);
    setSyncStatus("error", "Tải cloud lỗi.");
    if (showMessage) showToast(t("cloudError"));
    return false;
  } finally {
    if (showMessage) setButtonBusy(dom.cloudLoadBtn, false);
  }
}

async function syncFromCloudIfNewer() {
  if (!navigator.onLine) return false;
  if (runtime.isCloudSaving) return false;

  const localHasUnsavedChanges =
    runtime.dirtyVersion !== runtime.lastSavedVersion;

  if (localHasUnsavedChanges) {
    scheduleCloudSave(300);
    return false;
  }

  try {
    const cloudDoc = getCloudDoc(await loadDataFromCloud());

    if (!cloudDoc?.data) return false;

    if (isCloudNewer(cloudDoc)) {
      store.data = normalizeData(cloudDoc.data);
      runtime.cloudUpdatedAt =
        cloudDoc.updatedAt || cloudDoc.data.savedAt || "";
      runtime.lastCloudLoadAt = Date.now();
      runtime.dirtyVersion += 1;
      runtime.lastSavedVersion = runtime.dirtyVersion;

      writeSyncMeta({
        dirty: false,
        dirtyVersion: runtime.dirtyVersion,
        lastSavedVersion: runtime.lastSavedVersion,
        cloudUpdatedAt: runtime.cloudUpdatedAt,
        lastCloudLoadAt: runtime.lastCloudLoadAt,
      });

      invalidateAnalytics();
      saveLocal();
      loadPage(runtime.currentPage);
      setSyncStatus("saved");

      return true;
    }

    return false;
  } catch (error) {
    console.warn("Background cloud sync failed:", error);
    return false;
  }
}

async function bootFromCloud() {
  const meta = readSyncMeta();

  runtime.cloudUpdatedAt = meta.cloudUpdatedAt || "";
  runtime.dirtyVersion = Number(meta.dirtyVersion || 0);
  runtime.lastSavedVersion = Number(meta.lastSavedVersion || 0);

  store.data = loadLocal();
  invalidateAnalytics();
  loadPage(runtime.currentPage || "dashboard");

  if (!navigator.onLine) {
    setSyncStatus("offline", "Offline: đang dùng dữ liệu local.");
    showToast("Đang offline, dùng dữ liệu local.");
    return;
  }

  if (meta.dirty) {
    setSyncStatus("pending", "Có dữ liệu local chưa sync. Đang đẩy lên cloud.");
    scheduleCloudSave(300);
    return;
  }

  try {
    const cloudDoc = getCloudDoc(await loadDataFromCloud());

    if (cloudDoc?.data) {
      store.data = normalizeData(cloudDoc.data);
      runtime.cloudUpdatedAt =
        cloudDoc.updatedAt || cloudDoc.data.savedAt || "";
      runtime.dirtyVersion += 1;
      runtime.lastSavedVersion = runtime.dirtyVersion;

      writeSyncMeta({
        dirty: false,
        dirtyVersion: runtime.dirtyVersion,
        lastSavedVersion: runtime.lastSavedVersion,
        cloudUpdatedAt: runtime.cloudUpdatedAt,
        lastCloudLoadAt: Date.now(),
      });

      saveLocal();
      invalidateAnalytics();
      loadPage(runtime.currentPage || "dashboard");
      setSyncStatus("saved");
    } else {
      markDirty();
      scheduleCloudSave(300);
    }
  } catch (error) {
    console.error("Supabase boot error:", error);
    store.data = loadLocal();
    invalidateAnalytics();
    loadPage(runtime.currentPage || "dashboard");
    setSyncStatus("error", "Không tải được Supabase, đang dùng cache local.");
    showToast("Không tải được Supabase, đang dùng cache local");
  }
}
/* =========================================================
   DERIVED DATA / ANALYTICS CACHE
========================================================= */

function getAllItems() {
  return GROUPS.flatMap((key) =>
    store.data[key].map((item) => ({ ...item, group: key })),
  );
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
  if (
    runtime.analyticsCache &&
    runtime.analyticsCacheVersion === store.version
  ) {
    return runtime.analyticsCache;
  }

  const all = getAllItems();
  const done = all.filter((i) => i.status === STATUS.done).length;
  const important = all.filter((i) => i.status === STATUS.important).length;
  const overdue = all.filter(
    (i) => i.status !== STATUS.done && i.date && daysBetween(i.date) < 0,
  ).length;
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
    .map((item) => ({
      ...item,
      daysLeft: item.date ? daysBetween(item.date) : null,
    }))
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
  const totalSaved = records.reduce(
    (sum, d) => sum + (d.saved ? Number(d.deposit || CONFIG.dailySaving) : 0),
    0,
  );
  const totalWithdraw = records.reduce(
    (sum, d) => sum + Number(d.withdraw || 0),
    0,
  );
  const streaks = getKh2Streaks();
  const passRate60 = getKh2PassRate(CONFIG.heatmapDays);

  return {
    passDays,
    totalSaved,
    totalWithdraw,
    balance: totalSaved - totalWithdraw,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    missedDays: streaks.missedDays,
    lastPassDate: streaks.lastPassDate,
    lastMissDate: streaks.lastMissDate,
    todayPassed: streaks.todayPassed,
    yesterdayPassed: streaks.yesterdayPassed,
    streakStatus: streaks.status,
    streakLevel: streaks.level,
    streakHealth: getKh2StreakHealth(streaks, passRate60),
    streakMessage: streaks.message,
    passRate60,
  };
}

function getKh2Streaks() {
  const records = store.data.kh2Daily || {};

  let current = 0;
  let best = 0;
  let running = 0;
  let missedDays = 0;
  let lastPassDate = "";
  let lastMissDate = "";

  const todayKey = today();
  const yesterdayKey = addDays(todayKey, -1);

  for (let i = CONFIG.heatmapDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const record = records[date];

    if (record?.saved) {
      running += 1;
      best = Math.max(best, running);
      lastPassDate = date;
    } else {
      if (record) {
        missedDays += 1;
        lastMissDate = date;
      }

      running = 0;
    }
  }

  const todayPassed = Boolean(records[todayKey]?.saved);
  const yesterdayPassed = Boolean(records[yesterdayKey]?.saved);

  if (todayPassed) {
    for (let i = 0; i < CONFIG.heatmapDays; i++) {
      const date = addDays(todayKey, -i);

      if (records[date]?.saved) {
        current += 1;
      } else {
        break;
      }
    }
  } else if (yesterdayPassed) {
    for (let i = 1; i < CONFIG.heatmapDays; i++) {
      const date = addDays(todayKey, -i);

      if (records[date]?.saved) {
        current += 1;
      } else {
        break;
      }
    }
  }

  let status = "empty";
  let level = "Starter";
  let message = "Chưa có streak. Tick PASS hôm nay để bắt đầu.";

  if (current >= 30) {
    level = "Legend";
  } else if (current >= 14) {
    level = "Elite";
  } else if (current >= 7) {
    level = "Strong";
  } else if (current >= 3) {
    level = "Building";
  }

  if (todayPassed) {
    status = "active";
    message = `Streak đang chạy: ${current} ngày liên tiếp.`;
  } else if (yesterdayPassed) {
    status = "at-risk";
    message = `Streak ${current} ngày đang có nguy cơ mất. Tick PASS hôm nay để giữ chuỗi.`;
  } else if (lastPassDate) {
    status = "broken";
    message = `Streak đã bị ngắt. PASS gần nhất: ${formatDate(lastPassDate)}.`;
  }

  return {
    current,
    best,
    missedDays,
    lastPassDate,
    lastMissDate,
    todayPassed,
    yesterdayPassed,
    status,
    level,
    message,
  };
}
function getKh2StreakHealth(streaks, passRate60) {
  let score = 0;

  score += Math.min(streaks.current * 4, 40);
  score += Math.min(streaks.best * 2, 25);
  score += Math.round(passRate60 * 0.25);

  if (streaks.status === "active") score += 10;
  if (streaks.status === "at-risk") score -= 12;
  if (streaks.status === "broken") score -= 20;

  return clamp(score, 0, 100);
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
    (item) =>
      item.status === STATUS.done && isWithinLastDays(item.updatedAt, 7),
  ).length;
  const addedThisWeek = all.filter((item) =>
    isWithinLastDays(item.createdAt, 7),
  ).length;

  let savedThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(today(), -i);
    if (store.data.kh2Daily?.[date]?.saved) savedThisWeek += 1;
  }

  return { completedThisWeek, addedThisWeek, savedThisWeek };
}

function getLifeScore(all = getAllItems(), kh2 = getKh2Stats(), counts = {}) {
  const total = all.length;
  const done =
    counts.done ?? all.filter((i) => i.status === STATUS.done).length;
  const overdue =
    counts.overdue ??
    all.filter(
      (i) => i.status !== STATUS.done && i.date && daysBetween(i.date) < 0,
    ).length;
  const important =
    counts.important ?? all.filter((i) => i.status === STATUS.important).length;

  const completionScore = total ? (done / total) * 35 : 18;
  const deadlineScore = clamp(30 - overdue * 7, 0, 30);
  const financeScore =
    kh2.balance >= 0 ? 20 : clamp(20 + kh2.balance / 50000, 0, 20);
  const consistencyScore = clamp(kh2.passRate60 / 100, 0, 1) * 15;
  const penalty = Math.min(important * 1.5, 8);

  const score = Math.round(
    clamp(
      completionScore +
        deadlineScore +
        financeScore +
        consistencyScore -
        penalty,
      0,
      100,
    ),
  );

  let label = runtime.currentLang === "vi" ? "Ổn định" : "Stable";
  if (score >= 85)
    label = runtime.currentLang === "vi" ? "Rất tốt" : "Excellent";
  else if (score >= 70)
    label = runtime.currentLang === "vi" ? "Ổn định" : "Stable";
  else if (score >= 50)
    label = runtime.currentLang === "vi" ? "Cần chú ý" : "Needs attention";
  else label = runtime.currentLang === "vi" ? "Cần xử lý" : "Critical";

  return { score, label, overdue, important };
}
function getPriorityTask() {
  const items = getAnalytics()
    .all.filter((item) => item.status !== STATUS.done)
    .map((item) => ({
      ...item,
      daysLeft: item.date ? daysBetween(item.date) : null,
    }));

  if (!items.length) return null;

  return items
    .map((item) => {
      let score = 0;

      if (item.daysLeft !== null && item.daysLeft < 0) score += 100;
      else if (item.daysLeft === 0) score += 80;
      else if (item.daysLeft === 1) score += 60;
      else if (item.daysLeft !== null && item.daysLeft <= 3) score += 40;

      if (item.status === STATUS.important) score += 50;
      if (item.status === STATUS.doing) score += 20;
      if (!item.date) score -= 10;

      return {
        ...item,
        priorityScore: score,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)[0];
}
function getAssistantAdvice() {
  const priorityTask = getPriorityTask();

  const { kh2, dueSoon, life, all, overdue, important } = getAnalytics();

  const todayKh2 = Boolean(store.data.kh2Daily?.[today()]?.saved);

  const todoCount = all.filter((item) => item.status === STATUS.todo).length;
  const doingCount = all.filter((item) => item.status === STATUS.doing).length;
  const doneCount = all.filter((item) => item.status === STATUS.done).length;

  const advice = [];

  if (runtime.currentLang === "vi") {
    advice.push({
      type: life.score >= 70 ? "good" : life.score >= 50 ? "warning" : "danger",
      title: `PlanOS Score: ${life.score}/100`,
      body:
        life.score >= 85
          ? "Hệ thống đang rất ổn. Bạn có thể tiếp tục duy trì nhịp hiện tại."
          : life.score >= 70
            ? "Tình trạng tổng thể ổn định. Nên xử lý dần các mục quan trọng."
            : life.score >= 50
              ? "Hệ thống đang cần chú ý. Hãy ưu tiên deadline và KH2 hôm nay."
              : "PlanOS đang ở trạng thái căng. Nên xử lý việc quá hạn trước.",
      action:
        overdue > 0
          ? `Xử lý ${overdue} mục quá hạn`
          : important > 0
            ? `Xử lý ${important} mục quan trọng`
            : "Duy trì tiến độ hiện tại",
    });

    if (priorityTask) {
      advice.push({
        type:
          priorityTask.daysLeft !== null && priorityTask.daysLeft < 0
            ? "danger"
            : priorityTask.status === STATUS.important
              ? "warning"
              : "info",

        title: "Ưu tiên số 1 hôm nay",

        body: `${priorityTask.name}${
          priorityTask.date
            ? ` • Deadline: ${formatDate(priorityTask.date)}`
            : ""
        }`,

        action:
          priorityTask.daysLeft !== null && priorityTask.daysLeft < 0
            ? "Xử lý ngay vì đã quá hạn"
            : priorityTask.daysLeft === 0
              ? "Hoàn thành trong hôm nay"
              : priorityTask.status === STATUS.important
                ? "Ưu tiên trước các việc khác"
                : "Đưa vào Today Focus",
      });
    }

    if (!todayKh2) {
      advice.push({
        type: kh2.streakStatus === "at-risk" ? "danger" : "warning",
        title:
          kh2.streakStatus === "at-risk"
            ? "Streak đang có nguy cơ mất"
            : "KH2 hôm nay chưa PASS",
        body: kh2.streakMessage,
        action: "Mở KH2 và tick PASS hôm nay",
      });
    } else {
      advice.push({
        type: "good",
        title: `KH2 streak: ${kh2.currentStreak} ngày`,
        body: `Bạn đang duy trì chuỗi tiết kiệm tốt. Best streak hiện tại là ${kh2.bestStreak} ngày.`,
        action: "Tiếp tục giữ streak",
      });
    }

    if (kh2.balance < 0) {
      advice.push({
        type: "danger",
        title: `KH2 đang âm ${formatMoney(Math.abs(kh2.balance))}`,
        body: "Quỹ tiết kiệm đang bị rút nhiều hơn số đã thêm. Nên bù lại để hệ thống tài chính ổn định.",
        action: "Ưu tiên bù quỹ KH2",
      });
    } else {
      advice.push({
        type: "good",
        title: `KH2 đang dương ${formatMoney(kh2.balance)}`,
        body: "Tình hình tài chính hiện tại ổn. Bạn có thể tiếp tục duy trì mức tiết kiệm hằng ngày.",
        action: "Duy trì 15.000đ/ngày",
      });
    }

    if (dueSoon.length) {
      advice.push({
        type: "warning",
        title: `${dueSoon.length} mục gần hạn`,
        body: "Có một số việc cần chú ý trong 3 ngày tới. Nên xử lý trước các mục có deadline gần nhất.",
        action: "Mở Today Focus",
      });
    }

    advice.push({
      type: "info",
      title: "Tóm tắt workflow",
      body: `Hiện có ${todoCount} Todo, ${doingCount} Doing và ${doneCount} mục đã xong.`,
      action:
        doingCount > 3
          ? "Giảm bớt việc đang làm"
          : "Workflow đang kiểm soát được",
    });

    return advice.slice(0, 6);
  }

  if (priorityTask) {
    advice.push({
      type:
        priorityTask.daysLeft !== null && priorityTask.daysLeft < 0
          ? "danger"
          : priorityTask.status === STATUS.important
            ? "warning"
            : "info",

      title: "Top priority today",

      body: `${priorityTask.name}${
        priorityTask.date ? ` • Deadline: ${formatDate(priorityTask.date)}` : ""
      }`,

      action:
        priorityTask.daysLeft !== null && priorityTask.daysLeft < 0
          ? "Handle immediately"
          : priorityTask.daysLeft === 0
            ? "Finish today"
            : priorityTask.status === STATUS.important
              ? "Prioritize this first"
              : "Move into Today Focus",
    });
  }

  advice.push(
    {
      type: life.score >= 70 ? "good" : life.score >= 50 ? "warning" : "danger",
      title: `PlanOS Score: ${life.score}/100`,
      body:
        life.score >= 70
          ? "Your system is stable. Keep the current rhythm."
          : "Your system needs attention. Prioritize deadlines and KH2 today.",
      action:
        overdue > 0 ? `Resolve ${overdue} overdue items` : "Keep momentum",
    },
    {
      type: todayKh2 ? "good" : "warning",
      title: todayKh2
        ? `KH2 streak: ${kh2.currentStreak} days`
        : "KH2 has not passed today",
      body: todayKh2
        ? `Best streak is ${kh2.bestStreak} days.`
        : "Update KH2 today to keep your streak alive.",
      action: todayKh2 ? "Keep the streak" : "Open KH2 and mark PASS",
    },
    {
      type: "info",
      title: "Workflow summary",
      body: `${todoCount} Todo, ${doingCount} Doing and ${doneCount} completed items.`,
      action:
        doingCount > 3 ? "Reduce active work" : "Workflow is under control",
    },
  );

  return advice.slice(0, 6);
}

/* =========================================================
   LANGUAGE / THEME
========================================================= */

function applyLanguage() {
  if (dom.globalSearch) dom.globalSearch.placeholder = t("search");
  if (dom.addPlanBtn) dom.addPlanBtn.textContent = t("add");
  if (dom.cloudSaveBtn && !runtime.isCloudSaving) {
    setSyncStatus(runtime.syncStatus || "idle");
  }
  if (dom.cloudLoadBtn) dom.cloudLoadBtn.textContent = t("load");
  if (dom.logoutBtn) dom.logoutBtn.textContent = t("logout");
  if (dom.langBtn) dom.langBtn.textContent = runtime.currentLang.toUpperCase();
  if (dom.pageTitle) dom.pageTitle.textContent = t(runtime.currentPage);
  if (dom.cancelModalBtn) dom.cancelModalBtn.textContent = t("cancel");
  if ($("modalSaveBtn")) $("modalSaveBtn").textContent = t("formSave");

  $$("[data-i18n]").forEach((el) => {
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

async function handleLogin(event) {
  event.preventDefault();

  const username = dom.loginUsername?.value.trim();
  const password = dom.loginPassword?.value.trim();

  if (username === CONFIG.loginUsername && password === CONFIG.loginPassword) {
    sessionStorage.setItem(CONFIG.storage.login, "true");

    dom.loginError?.classList.remove("show");
    dom.loginScreen?.classList.add("hide");
    dom.app?.classList.add("hide");
    dom.loadingScreen?.classList.add("show");

    setTimeout(async () => {
      dom.loadingScreen?.classList.remove("show");
      dom.app?.classList.remove("hide");

      await bootFromCloud();

      applyLanguage();
      updateRealTimeClock();

      showToast(t("loginSuccess"));
    }, CONFIG.loadingDuration);

    return;
  }

  dom.loginError?.classList.add("show");

  if (dom.loginPassword) {
    dom.loginPassword.value = "";
  }
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
function renderStreakIntelligence(kh2) {
  const statusClass = `streak-${kh2.streakStatus || "empty"}`;

  return `
    <div class="streak-card ${statusClass}">
      <div class="streak-main">
        <div>
          <p class="eyebrow">KH2 STREAK ENGINE</p>
          <h3>🔥 ${kh2.currentStreak} ngày</h3>
          <p class="muted">${escapeHTML(kh2.streakMessage)}</p>
        </div>

        <div class="streak-level">
          <span>${escapeHTML(kh2.streakLevel)}</span>
        </div>
      </div>

      <div class="streak-grid">
        <div>
          <strong>${kh2.bestStreak}</strong>
          <span>Best streak</span>
        </div>
        <div>
          <strong>${kh2.passRate60}%</strong>
          <span>Pass rate</span>
        </div>
        <div>
          <strong>${kh2.missedDays}</strong>
          <span>Ngày fail</span>
        </div>
        <div>
          <strong>${kh2.lastPassDate ? formatDate(kh2.lastPassDate) : "--"}</strong>
          <span>PASS gần nhất</span>
        </div>
      </div>
    </div>
  `;
}
function renderAssistantCard(item) {
  const iconMap = {
    good: "✅",
    warning: "⚠️",
    danger: "🚨",
    info: "💡",
  };

  return `
    <div class="assistant-card assistant-${escapeAttr(item.type)}">
      <div class="assistant-icon">
  ${iconMap[item.type] || "💡"}
</div>

      <div class="assistant-content">
        <strong>${escapeHTML(item.title)}</strong>
        <p>${escapeHTML(item.body)}</p>
        <span>${escapeHTML(item.action)}</span>
      </div>
    </div>
  `;
}
function renderKh1Todo() {
  const items = getFilteredItems(
    store.data.kh1.map((item) => ({ ...item, group: "kh1" })),
  ).sort((a, b) => {
    const da = a.datetime || a.date || "";
    const db = b.datetime || b.date || "";
    return da.localeCompare(db);
  });

  setContent(`
    <div class="grid">
      <div class="card hero small-hero">
        <h2>📚 KH1 Học tập</h2>
        <p>TodoList học tập có deadline chi tiết và email cảnh báo.</p>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Thêm Todo học tập</h3>
            <p class="muted">Nhập việc học, thời gian thực hiện và email nhận cảnh báo.</p>
          </div>
        </div>

        <form id="kh1TodoForm" class="kh1-form">
          <input type="hidden" id="kh1EditId" />

          <label>
            Tên việc học
            <input id="kh1TodoName" type="text" placeholder="VD: Ôn JavaScript DOM" required />
          </label>

          <div class="grid grid-2">
            <label>
              Ngày thực hiện
              <input id="kh1TodoDate" type="date" required />
            </label>

            <label>
              Giờ thực hiện
              <input id="kh1TodoTime" type="time" step="1" required />
            </label>
          </div>

          <label>
            Email nhận cảnh báo
            <input id="kh1TodoEmail" type="email" placeholder="email@example.com" />
          </label>

          <label>
            Trạng thái
            <select id="kh1TodoStatus">
              <option value="Todo">Todo</option>
              <option value="Doing">Doing</option>
              <option value="Quan trọng">Quan trọng</option>
              <option value="Xong">Xong</option>
            </select>
          </label>

          <label>
            Ghi chú
            <textarea id="kh1TodoNote" placeholder="Ghi chú thêm..."></textarea>
          </label>

          <div class="modal-actions">
            <button type="button" class="ghost-btn" id="kh1ResetBtn">Reset</button>
            <button type="submit" class="primary-btn" id="kh1SubmitBtn">Thêm Todo</button>
          </div>
        </form>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Danh sách Todo học tập</h3>
            <p class="muted">${items.length} nhiệm vụ học tập.</p>
          </div>
        </div>

        <div class="list">
          ${
            items.length
              ? items.map(renderKh1TodoItem).join("")
              : `<p class="muted">Chưa có todo học tập nào.</p>`
          }
        </div>
      </div>
    </div>
  `);

  initKh1TodoForm();
}
function renderKh1TodoItem(item) {
  const dateTimeText = item.datetime
    ? new Date(item.datetime).toLocaleString("vi-VN")
    : item.date
      ? formatDate(item.date)
      : "Chưa có thời gian";

  const left = item.datetime
    ? Math.ceil((new Date(item.datetime) - new Date()) / 1000)
    : null;

  let timeStatus = "";

  if (left !== null) {
    if (left < 0) {
      timeStatus = "Đã quá hạn";
    } else {
      const hours = Math.floor(left / 3600);
      const minutes = Math.floor((left % 3600) / 60);
      timeStatus = `Còn ${hours} giờ ${minutes} phút`;
    }
  }

  return `
    <div class="item kh1-todo-item">
      <div>
        <strong>${escapeHTML(item.name)}</strong>

        <p class="muted">
          📅 ${escapeHTML(dateTimeText)}
          ${timeStatus ? ` • ${escapeHTML(timeStatus)}` : ""}
        </p>

        ${item.email ? `<p class="muted">📧 ${escapeHTML(item.email)}</p>` : ""}

        ${item.note ? `<p class="muted">📝 ${escapeHTML(item.note)}</p>` : ""}
      </div>

      <div class="item-actions">
        <span class="badge ${badgeClass(item.status)}">
          ${escapeHTML(statusLabel(item.status))}
        </span>

        <button
          class="mini-btn"
          data-action="edit-kh1-todo"
          data-id="${escapeAttr(item.id)}"
        >
          Sửa
        </button>

        <button
          class="mini-btn danger"
          data-action="delete-kh1-todo"
          data-id="${escapeAttr(item.id)}"
        >
          Xóa
        </button>
      </div>
    </div>
  `;
}

function initKh1TodoForm() {
  const form = $("kh1TodoForm");
  if (!form) return;

  const editId = $("kh1EditId");
  const nameInput = $("kh1TodoName");
  const dateInput = $("kh1TodoDate");
  const timeInput = $("kh1TodoTime");
  const emailInput = $("kh1TodoEmail");
  const statusInput = $("kh1TodoStatus");
  const noteInput = $("kh1TodoNote");
  const resetBtn = $("kh1ResetBtn");
  const submitBtn = $("kh1SubmitBtn");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const email = emailInput.value.trim();
    const status = statusInput.value;
    const note = noteInput.value.trim();

    if (!name || !date || !time) {
      showToast("Vui lòng nhập đủ tên, ngày và giờ.");
      return;
    }

    const datetime = `${date}T${time}`;
    const now = new Date().toISOString();

    const payload = {
      id: editId.value || uid(),
      name,
      date,
      time,
      datetime,
      email,
      status,
      note,
      updatedAt: now,
    };

    commit(
      (data) => {
        if (editId.value) {
          data.kh1 = data.kh1.map((item) =>
            item.id === editId.value
              ? {
                  ...item,
                  ...payload,
                  browserAlertSent: false,
                  emailAlertSent: false,
                }
              : item,
          );
        } else {
          data.kh1.push({
            ...payload,
            createdAt: now,
            emailAlertSent: false,
            browserAlertSent: false,
          });
        }
      },
      {
        activity: {
          action: editId.value ? "Sửa KH1 Todo" : "Thêm KH1 Todo",
          detail: name,
        },
        render: true,
        toast: editId.value ? "Đã cập nhật KH1 Todo" : "Đã thêm KH1 Todo",
      },
    );
  });

  resetBtn.addEventListener("click", () => {
    editId.value = "";
    form.reset();
    submitBtn.textContent = "Thêm Todo";
  });
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
function renderKh6PaymentItem(item) {
  const dateTimeText = item.datetime
    ? new Date(item.datetime).toLocaleString("vi-VN")
    : item.date
      ? `${formatDate(item.date)} ${item.time || ""}`
      : "Chưa có thời gian";

  return `
    <div class="item payment-item ${item.paid ? "payment-paid" : ""}">
      <div>
        <strong>${escapeHTML(item.name)}</strong>
        <p class="muted">
          💳 Kỳ thanh toán MoMo • ${escapeHTML(dateTimeText)}
          ${item.note ? " • " + escapeHTML(item.note) : ""}
        </p>
      </div>

      <div class="item-actions">
        <label class="payment-check">
          <input
            type="checkbox"
            data-action="toggle-kh6-paid"
            data-id="${escapeAttr(item.id)}"
            ${item.paid ? "checked" : ""}
          />
          <span>Đã thanh toán</span>
        </label>

        <button
          class="mini-btn"
          data-action="edit-item"
          data-group="kh6"
          data-id="${escapeAttr(item.id)}"
        >
          Sửa
        </button>

        <button
          class="mini-btn danger"
          data-action="delete-item"
          data-group="kh6"
          data-id="${escapeAttr(item.id)}"
        >
          Xóa
        </button>
      </div>
    </div>
  `;
}
function getPageSearchResults() {
  const q = runtime.searchQuery.trim().toLowerCase();
  if (!q) return [];

  return Object.keys(pageInfo)
    .filter((page) => {
      const text = [
        page,
        t(page),
        pageInfo[page]?.desc ? t(pageInfo[page].desc) : "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    })
    .map((page) => ({
      page,
      title: t(page),
      icon: pageInfo[page]?.icon || "📄",
      desc: pageInfo[page]?.desc ? t(pageInfo[page].desc) : "",
    }));
}
function renderGlobalSearchResults() {
  const q = runtime.searchQuery.trim();

  const pageResults = getPageSearchResults();
  const itemResults = getFilteredItems(getAnalytics().all);

  const total = pageResults.length + itemResults.length;

  setContent(`
    <div class="grid">
      <div class="card hero small-hero">
        <p class="eyebrow">GLOBAL SEARCH</p>
        <h2>🔍 Kết quả tìm kiếm</h2>
        <p>Đang tìm: <strong>${escapeHTML(q)}</strong></p>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Tìm thấy ${total} kết quả</h3>
            <p class="muted">Tìm trong trang, nhóm KH, tiêu đề, ghi chú, trạng thái và ngày.</p>
          </div>

          <button class="ghost-btn" data-action="clear-search">
            Xóa tìm kiếm
          </button>
        </div>

        <div class="list">
          ${
            pageResults.length
              ? pageResults
                  .map(
                    (item) => `
                      <div class="item">
                        <div>
                          <strong>${item.icon} ${escapeHTML(item.title)}</strong>
                          <p class="muted">${escapeHTML(item.desc)}</p>
                        </div>

                        <button
                          class="primary-btn"
                          data-action="open-search-page"
                          data-page="${escapeAttr(item.page)}"
                        >
                          Mở
                        </button>
                      </div>
                    `,
                  )
                  .join("")
              : ""
          }

          ${itemResults.length ? itemResults.map(renderItem).join("") : ""}

          ${
            total === 0
              ? `<p class="muted">Không tìm thấy kết quả nào.</p>`
              : ""
          }
        </div>
      </div>
    </div>
  `);
}
/* =========================================================
   PAGES
========================================================= */

function renderDashboard() {
  const analytics = getAnalytics();

  const allItems = getFilteredItems(analytics.all);

  const done = allItems.filter((i) => i.status === STATUS.done).length;

  const important = allItems.filter(
    (i) => i.status === STATUS.important,
  ).length;

  const advice = getAssistantAdvice();

  const kh2Today = Boolean(store.data.kh2Daily?.[today()]?.saved);

  const greeting = getDailyGreeting();

  setContent(`
    <div class="grid">

      <div class="card hero">
        <p class="eyebrow">${escapeHTML(greeting.period)} • ${t("commandHint")}</p>

        <h2>${escapeHTML(greeting.title)}</h2>

        <p>${escapeHTML(greeting.quote)}</p>
      </div>

      <div class="grid grid-2">

        <div class="card">
          <div class="section-head">

            <div>
              <h3>${t("lifeScore")}</h3>

              <p class="muted">
                ${t("lifeScoreDesc")}
              </p>
            </div>

            ${renderScoreRing(analytics.life.score)}

          </div>

          <div class="list">

            ${renderMiniMetric(
              t("systemHealth"),
              analytics.life.label,
              `${analytics.life.overdue} ${t("overdueItems")} • ${analytics.life.important} ${t("important")}`,
            )}

            ${renderMiniMetric(
              t("kh2Today"),
              kh2Today ? t("passedToday") : t("notPassedToday"),
              analytics.kh2.streakMessage,
            )}

          </div>
        </div>

        <div class="card">
          <div class="section-head">

            <div>
              <h3>${t("todayFocus")}</h3>

              <p class="muted">
                ${t("todayFocusDesc")}
              </p>
            </div>

            <button
              class="primary-btn"
              data-action="add-item"
              data-group="kh1"
            >
              ${t("addPlan")}
            </button>

          </div>

          <div class="list">

            ${
              analytics.todayFocus.length
                ? analytics.todayFocus.map(renderItem).join("")
                : `<p class="muted">${t("noTodayFocus")}</p>`
            }

          </div>
        </div>

      </div>

      <div class="grid grid-4">

        ${statCard(t("totalItems"), allItems.length, t("totalSystem"))}

        ${statCard(t("completed"), done, t("completedDesc"))}

        ${statCard(t("important"), important, t("importantDesc"))}

        ${statCard(
          t("kh2Balance"),
          formatMoney(analytics.kh2.balance),
          t("balanceDesc"),
          analytics.kh2.balance < 0 ? "danger-text" : "success-text",
        )}

      </div>

      <div class="grid grid-4">

        ${statCard(t("currentStreak"), analytics.kh2.currentStreak, "KH2")}

        ${statCard(t("bestStreak"), analytics.kh2.bestStreak, "KH2")}

        ${statCard(t("passRate"), `${analytics.kh2.passRate60}%`, "KH2")}

        ${statCard(
          t("fundBalance"),
          formatMoney(analytics.kh2.balance),
          t("balanceDesc"),
          analytics.kh2.balance < 0 ? "danger-text" : "success-text",
        )}

      </div>

      <div class="grid grid-2">

        <!-- AI ASSISTANT -->
        <div class="card">

          <div class="section-head">
            <div>
              <h3>${t("assistant")}</h3>

              <p class="muted">
                AI Operating System Assistant
              </p>
            </div>

            <span class="badge blue">
              PLANOS AI
            </span>
          </div>

          <div class="list assistant-list">

            ${advice.map(renderAssistantCard).join("")}

          </div>

        </div>

        <!-- WEEKLY REVIEW -->
        <div class="card">

          <div class="section-head">
            <div>
              <h3>${t("weeklyReview")}</h3>

              <p class="muted">
                ${t("weeklyReviewDesc")}
              </p>
            </div>

            <span class="badge green">
              WEEKLY
            </span>
          </div>

          <div class="list">

            ${renderMiniMetric(
              t("completedThisWeek"),
              analytics.weekly.completedThisWeek,
            )}

            ${renderMiniMetric(
              t("addedThisWeek"),
              analytics.weekly.addedThisWeek,
            )}

            ${renderMiniMetric(
              t("savedThisWeek"),
              `${analytics.weekly.savedThisWeek}/7`,
            )}

          </div>

        </div>

      </div>

      <div class="grid grid-2">

        <!-- DEADLINES -->
        <div class="card">

          <div class="section-head">
            <div>
              <h3>${t("dueTitle")}</h3>

              <p class="muted">
                Upcoming deadlines & urgent tasks
              </p>
            </div>

            <span class="badge yellow">
              DEADLINES
            </span>
          </div>

          <div class="list">

            ${
              analytics.dueSoon.length
                ? analytics.dueSoon.slice(0, 6).map(renderItem).join("")
                : `<p class="muted">${t("noDue")}</p>`
            }

          </div>

        </div>

        <!-- RECENT -->
        <div class="card">

          <div class="section-head">

            <div>
              <h3>${t("recentPlans")}</h3>

              <p class="muted">
                ${t("recentPlansDesc")}
              </p>
            </div>

            <span class="badge blue">
              RECENT
            </span>

          </div>

          <div class="list">

            ${
              allItems.length
                ? allItems.slice(-8).reverse().map(renderItem).join("")
                : `<p class="muted">${t("emptyPlans")}</p>`
            }

          </div>

        </div>

      </div>

    </div>
  `);

  /* IMPORTANT */
  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderKhPage(key) {
  if (key === "kh1") return renderKh1Todo();
  if (key === "kh2") return renderKh2();
  if (key === "kh6") return renderKh6();
  const items = getFilteredItems(
    store.data[key].map((item) => ({ ...item, group: key })),
  );

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
function renderKh6() {
  const items = getFilteredItems(
    store.data.kh6.map((item) => ({ ...item, group: "kh6" })),
  ).sort((a, b) => {
    const da = a.datetime || `${a.date || ""}T${a.time || "00:00"}`;
    const db = b.datetime || `${b.date || ""}T${b.time || "00:00"}`;
    return da.localeCompare(db);
  });

  setContent(`
    <div class="grid">
      <div class="card hero small-hero">
        <h2>💳 KH6 MoMo</h2>
        <p>Theo dõi các kỳ góp MoMo theo ngày, tháng, năm và thời gian.</p>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Danh sách kỳ thanh toán MoMo</h3>
            <p class="muted">Tick khi đã thanh toán. Kỳ đã thanh toán sẽ bị gạch ngang, chỉ xoá khi bấm nút Xóa.</p>
          </div>

          <button class="primary-btn" data-action="add-item" data-group="kh6">
            + Thêm kỳ thanh toán
          </button>
        </div>

        <div class="list">
          ${
            items.length
              ? items.map(renderKh6PaymentItem).join("")
              : `<p class="muted">Chưa có kỳ thanh toán MoMo nào.</p>`
          }
        </div>
      </div>
    </div>
  `);
}
function renderKh2() {
  const { kh2 } = getAnalytics();

  setContent(`
    <div class="grid">
      <div class="card hero small-hero kh2-hero-with-topup">
        <div class="kh2-hero-copy">
          <h2>💰 ${t("kh2")}</h2>
          <p>${t("kh2Desc")}</p>
        </div>

        <div class="kh2-hero-topup">
          <strong>💸 Bù quỹ thông minh</strong>

          <p>
            Nhập tiền dư để app tự bù các ngày chưa PASS gần nhất.
            30.000đ = 2 ngày.
          </p>

          <div class="smart-topup-row">
            <input
              id="kh2TopupAmount"
              type="number"
              min="0"
              step="1000"
              placeholder="Ví dụ: 30000"
            />

            <button
              type="button"
              class="primary-btn"
              data-action="kh2-smart-topup"
            >
              Bù tự động
            </button>
          </div>
        </div>
      </div>
      ${renderStreakIntelligence(kh2)}
      <div class="grid grid-4">
        ${statCard(t("passDays"), kh2.passDays, "Số ngày có tiết kiệm")}
        ${statCard("🔥 Streak hiện tại", `${kh2.currentStreak} ngày`, kh2.streakLevel)}
${statCard("🏆 Best streak", `${kh2.bestStreak} ngày`, "Kỷ lục tốt nhất")}
${statCard("📉 Ngày fail", kh2.missedDays, `Trong ${CONFIG.heatmapDays} ngày`)}
${statCard("🧠 Streak Health", `${kh2.streakHealth}/100`, "Độ khỏe thói quen")}
      </div>

      <div class="grid grid-4">
        ${statCard(t("totalSaved"), formatMoney(kh2.totalSaved), "Tổng tiền đã tiết kiệm")}
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
            <div>
              <strong>Đã thêm tiền vào quỹ</strong>
              <p class="muted">Tick nếu ngày này có tiết kiệm. Số tiền có thể nhập tự do.</p>
            </div>
          </div>

          <label>
            Số tiền tiết kiệm ngày này
            <input type="number" id="kh2DepositInput" min="0" step="1000" placeholder="VD: 15000, 30000, 50000..." />
          </label>

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
            <div class="status-line"><span>Đã tiết kiệm?</span><strong id="kh2SelectedSaved">--</strong></div>
            <div class="status-line"><span>Số tiền tiết kiệm</span><strong id="kh2SelectedDeposit">0đ</strong></div>
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
  const entries = Object.entries(store.data.kh2Daily || {}).sort((a, b) =>
    b[0].localeCompare(a[0]),
  );

  if (!entries.length) return `<p class="muted">${t("noHistory")}</p>`;

  return entries
    .map(
      ([date, r]) => `
        <div class="item">
          <div>
            <strong>${escapeHTML(date)}</strong>
            <p class="muted">
              Đã thêm: ${formatMoney(r.saved ? r.deposit || CONFIG.dailySaving : 0)}
              • ${t("withdrawn")}: ${formatMoney(r.withdraw || 0)}
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
    {
      key: STATUS.important,
      title: runtime.currentLang === "vi" ? "Quan trọng" : "Important",
    },
    { key: STATUS.done, title: runtime.currentLang === "vi" ? "Xong" : "Done" },
  ];

  setContent(`
    <div class="grid">
      <div class="card hero small-hero"><h2>🧲 ${t("kanban")}</h2><p>${t("kanbanDesc")}</p></div>
      <div class="kanban">
        ${cols
          .map((col) => {
            const list = items.filter(
              (i) => (i.status || STATUS.todo) === col.key,
            );
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
  const depositInput = $("kh2DepositInput");
  const withdrawInput = $("kh2WithdrawInput");
  const noteInput = $("kh2NoteInput");
  const saveBtn = $("kh2SaveDayBtn");
  const deleteBtn = $("kh2DeleteDayBtn");

  if (
    !dateInput ||
    !savedInput ||
    !depositInput ||
    !withdrawInput ||
    !noteInput ||
    !saveBtn ||
    !deleteBtn
  )
    return;

  function renderSelected() {
    const date = dateInput.value;
    const record = store.data.kh2Daily[date] || {
      saved: false,
      deposit: 0,
      withdraw: 0,
      note: "",
    };

    savedInput.checked = Boolean(record.saved);
    depositInput.value = record.saved
      ? Number(record.deposit || CONFIG.dailySaving)
      : Number(record.deposit || 0) || "";
    withdrawInput.value = record.withdraw || "";
    noteInput.value = record.note || "";

    $("kh2SelectedDate").textContent = date || "--";

    const selectedSaved = $("kh2SelectedSaved");
    selectedSaved.textContent = record.saved
      ? `${t("pass")} ✅`
      : `${t("notPass")} ❌`;
    selectedSaved.className = record.saved ? "success-text" : "danger-text";

    $("kh2SelectedDeposit").textContent = record.saved
      ? formatMoney(record.deposit || CONFIG.dailySaving)
      : formatMoney(0);

    $("kh2SelectedWithdraw").textContent = formatMoney(record.withdraw || 0);
    $("kh2SelectedNote").textContent = record.note || t("noNote");
  }

  dateInput.value = today();
  renderSelected();

  dateInput.addEventListener("change", renderSelected);

  savedInput.addEventListener("change", () => {
    if (savedInput.checked && !Number(depositInput.value || 0)) {
      depositInput.value = CONFIG.dailySaving;
    }

    if (!savedInput.checked) {
      depositInput.value = "";
    }
  });

  depositInput.addEventListener("input", () => {
    const deposit = Number(depositInput.value || 0);

    if (deposit > 0) {
      savedInput.checked = true;
    }
  });

  saveBtn.addEventListener("click", () => {
    const date = dateInput.value;
    if (!date)
      return showToast(
        runtime.currentLang === "vi"
          ? "Bạn chưa chọn ngày 😭"
          : "Choose a date 😭",
      );

    commit(
      (data) => {
        const deposit = Math.max(0, Number(depositInput.value || 0));
        const saved = savedInput.checked || deposit > 0;

        data.kh2Daily[date] = {
          saved,
          deposit: saved ? deposit || CONFIG.dailySaving : 0,
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
        toast:
          runtime.currentLang === "vi" ? "Đã lưu ngày này ✅" : "Day saved ✅",
      },
    );
  });

  deleteBtn.addEventListener("click", () =>
    deleteKh2HistoryDay(dateInput.value),
  );
}

function selectKh2Date(date) {
  const dateInput = $("kh2DateInput");
  if (!date || !dateInput) return;

  dateInput.value = date;
  dateInput.dispatchEvent(new Event("change"));
  dateInput.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => dateInput.focus(), 320);
  showToast(
    runtime.currentLang === "vi" ? `Đã chọn ngày ${date}` : `Selected ${date}`,
  );
}

function deleteKh2HistoryDay(date) {
  if (!date) return;

  if (!store.data.kh2Daily[date]) {
    showToast(
      runtime.currentLang === "vi"
        ? "Ngày này chưa có dữ liệu 😭"
        : "No data for this day 😭",
    );
    return;
  }

  const ok = confirm(
    runtime.currentLang === "vi"
      ? `Xóa dữ liệu ngày ${date}?`
      : `Delete data of ${date}?`,
  );
  if (!ok) return;

  commit(
    (data) => {
      delete data.kh2Daily[date];
    },
    {
      activity: {
        action:
          runtime.currentLang === "vi"
            ? "Xóa dữ liệu KH2"
            : "Delete KH2 record",
        detail: `${t("day")} ${date}`,
      },
      toast:
        runtime.currentLang === "vi"
          ? `Đã xóa ngày ${date}`
          : `Deleted ${date}`,
    },
  );
}

/* =========================================================
   CRUD
========================================================= */

function openAddModal(
  type = runtime.currentPage === "dashboard" ? "kh1" : runtime.currentPage,
) {
  if (!GROUPS.includes(type)) type = "kh1";

  dom.editId.value = "";
  dom.modalMode.textContent = t("modalNew");
  dom.modalTitle.textContent = t("modalAddTitle");
  dom.planType.value = type;
  dom.planName.value = "";
  dom.planDate.value = "";
  if (dom.planTime) {
    dom.planTime.value = "";
  }
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
  if (dom.planTime) {
    dom.planTime.value = item.time || "";
  }
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
  if (
    !confirm(
      runtime.currentLang === "vi"
        ? "Bạn chắc chắn muốn xóa?"
        : "Delete this item?",
    )
  )
    return;

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
function editKh1Todo(id) {
  const item = store.data.kh1.find((todo) => todo.id === id);
  if (!item) return;

  const editId = $("kh1EditId");
  const nameInput = $("kh1TodoName");
  const dateInput = $("kh1TodoDate");
  const timeInput = $("kh1TodoTime");
  const emailInput = $("kh1TodoEmail");
  const statusInput = $("kh1TodoStatus");
  const noteInput = $("kh1TodoNote");
  const submitBtn = $("kh1SubmitBtn");

  editId.value = item.id;
  nameInput.value = item.name || "";
  dateInput.value = item.date || "";
  timeInput.value = item.time || "";
  emailInput.value = item.email || "";
  statusInput.value = item.status || "Todo";
  noteInput.value = item.note || "";

  submitBtn.textContent = "Lưu thay đổi";

  $("kh1TodoForm").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function deleteKh1Todo(id) {
  const item = store.data.kh1.find((todo) => todo.id === id);
  if (!item) return;

  if (!confirm(`Xóa todo "${item.name}"?`)) return;

  commit(
    (data) => {
      data.kh1 = data.kh1.filter((todo) => todo.id !== id);
    },
    {
      activity: {
        action: "Xóa KH1 Todo",
        detail: item.name,
      },
      render: true,
      toast: "Đã xóa KH1 Todo",
    },
  );
}
function moveItem(type, id, status) {
  if (!GROUPS.includes(type)) return;

  commit(
    (data) => {
      data[type] = data[type].map((item) =>
        item.id === id
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item,
      );
    },
    {
      activity: {
        action:
          runtime.currentLang === "vi" ? "Đổi trạng thái" : "Change status",
        detail: `${type.toUpperCase()} → ${status}`,
      },
    },
  );
}
function toggleKh6Paid(id) {
  const item = store.data.kh6.find((payment) => payment.id === id);

  if (!item) return;

  if (!item.paid) {
    const ok = confirm(`Đã thanh toán kỳ "${item.name}" chưa?`);

    if (!ok) {
      loadPage(runtime.currentPage);
      return;
    }
  }

  commit(
    (data) => {
      data.kh6 = data.kh6.map((payment) => {
        if (payment.id !== id) {
          return payment;
        }

        const newPaidState = !payment.paid;

        return {
          ...payment,
          paid: newPaidState,
          status: newPaidState ? STATUS.done : STATUS.todo,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    {
      activity: {
        action: item.paid ? "Bỏ thanh toán KH6" : "Thanh toán KH6",
        detail: item.name,
      },

      toast: item.paid ? "Đã bỏ đánh dấu thanh toán" : "Đã thanh toán ✅",
    },
  );

  loadPage(runtime.currentPage);
}
function handlePlanSubmit(event) {
  event.preventDefault();

  const type = dom.planType.value;
  const id = dom.editId.value;
  const name = dom.planName.value.trim();

  if (!GROUPS.includes(type) || !name) return;

  const now = new Date().toISOString();
  const date = dom.planDate.value;
  const time = dom.planTime?.value || "";
  const datetime = date && time ? `${date}T${time}` : "";

  const payload = {
    id: id || uid(),
    name,
    date,
    time,
    datetime,
    status: dom.planStatus.value,
    note: dom.planNote.value.trim(),
    updatedAt: now,
  };

  commit(
    (data) => {
      if (id) {
        data[type] = data[type].map((item) =>
          item.id === id ? { ...item, ...payload } : item,
        );
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
   PERSONAL SAVING MANAGER — FINANCIAL OS UPGRADE
========================================================= */

function inferSavingCategory(note = "", type = "deposit") {
  const text = String(note || "").toLowerCase();

  if (type === "deposit") {
    if (/lương|salary|thưởng|bonus|income|tiền dư|bỏ ống|save|tiết kiệm/.test(text)) return "Income";
    return "Saving";
  }

  if (/ăn|cơm|trà sữa|cafe|coffee|lẩu|food|drink|nước/.test(text)) return "Food";
  if (/momo|trả góp|bill|hóa đơn|netflix|spotify|domain|hosting|subscription/.test(text)) return "Bills";
  if (/xe|grab|xăng|bus|transport|taxi/.test(text)) return "Transport";
  if (/sách|khóa học|học|course|book/.test(text)) return "Learning";
  if (/game|phim|giải trí|movie|entertainment/.test(text)) return "Entertainment";
  if (/khẩn|bệnh|thuốc|sửa|emergency/.test(text)) return "Emergency";
  if (/laptop|pc|đồ công nghệ|tech/.test(text)) return "Tech";

  return "Other";
}

function inferSavingMood(note = "", type = "deposit", amount = 0) {
  const text = String(note || "").toLowerCase();

  if (type === "deposit") return amount >= 50000 ? "disciplined" : "steady";
  if (/buồn|stress|chán|mệt|bốc đồng|tự thưởng/.test(text)) return "emotional";
  if (/cần|bắt buộc|deadline|trả góp|hóa đơn|bill/.test(text)) return "necessary";
  if (amount >= 100000) return "high-impact";

  return "normal";
}

function getMonthKey(dateString = today()) {
  return String(dateString || today()).slice(0, 7);
}

function getMonthDays(monthKey = getMonthKey()) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function getActiveSavingTransactions() {
  return (store.data.personalSaving?.transactions || []).filter((tx) => !tx.deleted);
}

function getCurrentDailyMission() {
  const missions = [
    {
      id: "no-food-delivery",
      title: "Không order đồ ăn hôm nay",
      desc: "Giữ ví an toàn bằng cách tránh một khoản chi cảm xúc.",
      reward: "+5 Saving Score",
    },
    {
      id: "save-20k",
      title: "Save tối thiểu 20K",
      desc: "Một khoản nhỏ nhưng giúp giữ nhịp kỷ luật.",
      reward: "+1 Mission Streak",
    },
    {
      id: "review-spending",
      title: "Review 3 khoản chi gần nhất",
      desc: "Nhìn thẳng vào dòng tiền để kiểm soát nó.",
      reward: "+Insight",
    },
    {
      id: "no-spend-evening",
      title: "Không tiêu sau 22:00",
      desc: "Chặn chi tiêu bốc đồng vào cuối ngày.",
      reward: "+Discipline",
    },
    {
      id: "cut-coffee",
      title: "Cắt một khoản đồ uống",
      desc: "Giảm 1 ly hôm nay, tăng tự do tài chính ngày mai.",
      reward: "+Cashflow",
    },
  ];

  const seed = today()
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return missions[seed % missions.length];
}

function getFinancialAchievements(stats) {
  const rules = [
    {
      id: "first-save",
      icon: "🌱",
      title: "Khoản tiết kiệm đầu tiên",
      unlocked: stats.totalDeposit > 0,
    },
    {
      id: "one-million",
      icon: "💎",
      title: "Chạm mốc 1 triệu",
      unlocked: stats.balance >= 1000000,
    },
    {
      id: "five-million",
      icon: "🏦",
      title: "Vault 5 triệu",
      unlocked: stats.balance >= 5000000,
    },
    {
      id: "goal-crusher",
      icon: "🎯",
      title: "Vượt mục tiêu tháng",
      unlocked: stats.monthlyGoal > 0 && stats.goalProgress >= 100,
    },
    {
      id: "no-withdraw-week",
      icon: "🛡️",
      title: "7 ngày không rút",
      unlocked: stats.daysSinceWithdraw >= 7,
    },
    {
      id: "mission-complete",
      icon: "⚡",
      title: "Hoàn thành mission hôm nay",
      unlocked: Boolean(stats.missionDoneToday),
    },
  ];

  return rules;
}

function getPersonalSavingStats() {
  const saving = store.data.personalSaving || {
    monthlyGoal: 0,
    lockUntil: "",
    noSpendUntil: "",
    noSpendReason: "",
    filter: "all",
    subscriptions: [],
    missionLog: {},
    achievements: {},
    transactions: [],
  };

  const allTransactions = Array.isArray(saving.transactions) ? saving.transactions : [];
  const activeTransactions = allTransactions.filter((tx) => !tx.deleted);
  const monthKey = getMonthKey();
  const monthDays = getMonthDays(monthKey);
  const currentDay = Number(today().slice(8, 10));
  const monthTransactions = activeTransactions.filter((tx) => String(tx.date || "").startsWith(monthKey));

  const totalDeposit = activeTransactions
    .filter((tx) => tx.type === "deposit")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalWithdraw = activeTransactions
    .filter((tx) => tx.type === "withdraw")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const monthDeposit = monthTransactions
    .filter((tx) => tx.type === "deposit")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const monthWithdraw = monthTransactions
    .filter((tx) => tx.type === "withdraw")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const balance = totalDeposit - totalWithdraw;
  const monthNet = monthDeposit - monthWithdraw;
  const withdrawRate = totalDeposit > 0 ? Math.round((totalWithdraw / totalDeposit) * 100) : 0;
  const goalProgress = saving.monthlyGoal > 0 ? clamp(Math.round((monthNet / saving.monthlyGoal) * 100), 0, 150) : 0;
  const monthProjectedNet = currentDay > 0 ? Math.round((monthNet / currentDay) * monthDays) : monthNet;

  const isLocked = Boolean(
    saving.lockUntil &&
      new Date(`${saving.lockUntil}T23:59:59`).getTime() >= Date.now(),
  );

  const noSpendActive = Boolean(
    saving.noSpendUntil &&
      new Date(`${saving.noSpendUntil}T23:59:59`).getTime() >= Date.now(),
  );

  const dailyAverageWithdraw = currentDay > 0 ? Math.round(monthWithdraw / currentDay) : 0;
  const burnDaysLeft = dailyAverageWithdraw > 0 ? Math.floor(balance / dailyAverageWithdraw) : 999;
  const targetDailyNeed =
    saving.monthlyGoal > 0
      ? Math.max(0, Math.ceil((saving.monthlyGoal - monthNet) / Math.max(1, monthDays - currentDay + 1)))
      : 0;

  const lastWithdraw = activeTransactions
    .filter((tx) => tx.type === "withdraw")
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];

  const daysSinceWithdraw = lastWithdraw ? Math.max(0, daysBetween(lastWithdraw.date) * -1) : 999;
  const mission = getCurrentDailyMission();
  const missionDoneToday = Boolean(saving.missionLog?.[today()]?.[mission.id]);

  const categoryTotals = activeTransactions.reduce((map, tx) => {
    const key = tx.category || inferSavingCategory(tx.note, tx.type);
    if (!map[key]) map[key] = { deposit: 0, withdraw: 0, count: 0 };
    map[key][tx.type] += Number(tx.amount || 0);
    map[key].count += 1;
    return map;
  }, {});

  const topSpendingCategory = Object.entries(categoryTotals)
    .map(([name, item]) => ({ name, ...item }))
    .sort((a, b) => b.withdraw - a.withdraw)[0] || { name: "None", withdraw: 0, deposit: 0, count: 0 };

  const subscriptions = Array.isArray(saving.subscriptions) ? saving.subscriptions.filter((sub) => sub.active !== false) : [];
  const monthlySubscriptions = subscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
  const nextSubscription = subscriptions
    .map((sub) => {
      const dueDate = `${monthKey}-${String(clamp(Number(sub.dueDay || 1), 1, monthDays)).padStart(2, "0")}`;
      let left = daysBetween(dueDate);
      let displayDate = dueDate;
      if (left < 0) {
        const next = addDays(dueDate, monthDays);
        left = daysBetween(next);
        displayDate = next;
      }
      return { ...sub, left, displayDate };
    })
    .sort((a, b) => a.left - b.left)[0];

  const simulation90Days = Math.max(0, Math.round(balance + (monthNet / Math.max(1, currentDay)) * 90));
  const daysToGoal =
    saving.monthlyGoal > 0 && monthNet > 0
      ? Math.ceil(Math.max(0, saving.monthlyGoal - monthNet) / Math.max(1, monthNet / Math.max(1, currentDay)))
      : null;

  const financialMood = getFinancialMood({
    balance,
    monthNet,
    withdrawRate,
    goalProgress,
    noSpendActive,
    burnDaysLeft,
  });

  const savingScore = getPersonalSavingScore({
    balance,
    monthNet,
    withdrawRate,
    goalProgress,
    transactionCount: activeTransactions.length,
    noSpendActive,
    missionDoneToday,
    daysSinceWithdraw,
  });

  const advice = getPersonalSavingAdvice({
    balance,
    monthDeposit,
    monthWithdraw,
    monthNet,
    withdrawRate,
    goalProgress,
    monthlyGoal: saving.monthlyGoal,
    isLocked,
    noSpendActive,
    burnDaysLeft,
    topSpendingCategory,
    targetDailyNeed,
  });

  const achievements = getFinancialAchievements({
    balance,
    totalDeposit,
    monthlyGoal: saving.monthlyGoal,
    goalProgress,
    daysSinceWithdraw,
    missionDoneToday,
  });

  const unlockedAchievements = achievements.filter((item) => item.unlocked).length;

  return {
    ...saving,
    transactions: activeTransactions,
    deletedTransactions: allTransactions.filter((tx) => tx.deleted),
    totalDeposit,
    totalWithdraw,
    balance,
    monthDeposit,
    monthWithdraw,
    monthNet,
    monthProjectedNet,
    monthKey,
    withdrawRate,
    goalProgress,
    savingScore,
    advice,
    isLocked,
    noSpendActive,
    dailyAverageWithdraw,
    burnDaysLeft,
    targetDailyNeed,
    categoryTotals,
    topSpendingCategory,
    subscriptions,
    monthlySubscriptions,
    nextSubscription,
    simulation90Days,
    daysToGoal,
    financialMood,
    mission,
    missionDoneToday,
    achievements,
    unlockedAchievements,
  };
}

function getFinancialMood(stats) {
  if (stats.noSpendActive) return { label: "No-Spend Mode", className: "danger", icon: "🥷" };
  if (stats.balance <= 0 || stats.burnDaysLeft <= 7) return { label: "Danger Zone", className: "danger", icon: "🚨" };
  if (stats.withdrawRate >= 60 || stats.monthNet < 0) return { label: "Recovering", className: "warning", icon: "🛠️" };
  if (stats.goalProgress >= 100) return { label: "Goal Crusher", className: "good", icon: "🏆" };
  if (stats.monthNet > 0) return { label: "Stable Growth", className: "good", icon: "📈" };
  return { label: "Neutral", className: "info", icon: "🧭" };
}

function getPersonalSavingScore(stats) {
  let score = 42;

  if (stats.balance > 0) score += 12;
  if (stats.monthNet > 0) score += 14;
  if (stats.goalProgress >= 100) score += 18;
  else score += Math.round(Math.min(stats.goalProgress, 100) * 0.13);

  if (stats.withdrawRate > 80) score -= 28;
  else if (stats.withdrawRate > 55) score -= 18;
  else if (stats.withdrawRate > 35) score -= 8;

  if (stats.transactionCount >= 5) score += 4;
  if (stats.noSpendActive) score += 6;
  if (stats.missionDoneToday) score += 5;
  if (stats.daysSinceWithdraw >= 7) score += 6;

  return clamp(score, 0, 100);
}

function getPersonalSavingAdvice(stats) {
  if (stats.balance <= 0) {
    return {
      type: "warning",
      title: "Quỹ đang trống",
      body: "Hãy thêm khoản đầu tiên để kích hoạt Financial OS.",
      action: "+ Thêm tiền",
    };
  }

  if (stats.burnDaysLeft <= 7) {
    return {
      type: "danger",
      title: "Burn-rate nguy hiểm",
      body: `Nếu giữ tốc độ rút hiện tại, quỹ có thể cạn trong khoảng ${stats.burnDaysLeft} ngày.`,
      action: "Bật No-Spend Mode",
    };
  }

  if (stats.withdrawRate >= 70) {
    return {
      type: "danger",
      title: "Tỉ lệ rút đang cao",
      body: `Bạn đã rút khoảng ${stats.withdrawRate}% so với tổng tiền đã thêm. Nhóm chi mạnh nhất: ${stats.topSpendingCategory.name}.`,
      action: "Giảm khoản chi cảm xúc",
    };
  }

  if (stats.monthlyGoal > 0 && stats.goalProgress < 50) {
    return {
      type: "warning",
      title: "Mục tiêu tháng còn xa",
      body: `Bạn cần khoảng ${formatMoney(stats.targetDailyNeed)}/ngày để kịp mục tiêu tháng.`,
      action: "Tăng khoản thêm hằng ngày",
    };
  }

  if (stats.monthlyGoal > 0 && stats.goalProgress >= 100) {
    return {
      type: "good",
      title: "Đã phá đảo mục tiêu tháng",
      body: "Bạn đã đạt hoặc vượt mục tiêu tiết kiệm tháng này. Có thể tăng cấp vault.",
      action: "Nâng mục tiêu tiếp theo",
    };
  }

  return {
    type: "good",
    title: "Quỹ đang ổn",
    body: "Dòng tiền tiết kiệm đang tích cực. Tiếp tục giữ nhịp và hoàn thành daily mission.",
    action: "Tiếp tục tiết kiệm",
  };
}

function renderFinancialHeatmap() {
  const records = {};
  getActiveSavingTransactions().forEach((tx) => {
    const date = tx.date || today();
    if (!records[date]) records[date] = 0;
    records[date] += tx.type === "deposit" ? Number(tx.amount || 0) : -Number(tx.amount || 0);
  });

  return `
    <div class="financial-heatmap">
      ${Array.from({ length: 35 })
        .map((_, index) => {
          const date = addDays(today(), index - 34);
          const value = records[date] || 0;
          const className = value > 0 ? "saving-day-good" : value < 0 ? "saving-day-bad" : "saving-day-empty";
          const label = `${formatDate(date)} • ${value === 0 ? "0đ" : formatMoney(value)}`;

          return `
            <button
              class="saving-day ${className}"
              title="${escapeAttr(label)}"
              aria-label="${escapeAttr(label)}"
              type="button"
            ></button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderCategoryRadar(stats) {
  const categories = Object.entries(stats.categoryTotals)
    .map(([name, item]) => ({
      name,
      withdraw: item.withdraw || 0,
      deposit: item.deposit || 0,
      count: item.count || 0,
    }))
    .sort((a, b) => b.withdraw - a.withdraw)
    .slice(0, 6);

  const max = Math.max(1, ...categories.map((item) => item.withdraw));

  if (!categories.length) {
    return `<p class="muted">Chưa có dữ liệu category.</p>`;
  }

  return `
    <div class="saving-radar">
      ${categories
        .map(
          (item) => `
            <div class="saving-radar-row">
              <span>${escapeHTML(item.name)}</span>
              <div class="saving-radar-bar">
                <span style="width:${Math.max(6, Math.round((item.withdraw / max) * 100))}%"></span>
              </div>
              <strong>${formatMoney(item.withdraw)}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderSavingTimelineChart() {
  const active = getActiveSavingTransactions();
  const values = Array.from({ length: 6 }).map((_, index) => {
    const base = new Date(`${today()}T00:00:00`);
    base.setMonth(base.getMonth() - (5 - index));
    const key = base.toISOString().slice(0, 7);
    const monthTx = active.filter((tx) => String(tx.date || "").startsWith(key));
    const deposit = monthTx
      .filter((tx) => tx.type === "deposit")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const withdraw = monthTx
      .filter((tx) => tx.type === "withdraw")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    return { key, net: deposit - withdraw };
  });

  const maxAbs = Math.max(1, ...values.map((item) => Math.abs(item.net)));

  return `
    <div class="saving-timeline-chart">
      ${values
        .map(
          (item) => `
            <div class="saving-chart-col">
              <div class="saving-chart-bar ${item.net >= 0 ? "positive" : "negative"}" style="height:${Math.max(8, Math.round((Math.abs(item.net) / maxAbs) * 100))}%"></div>
              <span>${item.key.slice(5)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderSavingVault(stats) {
  const level = Math.max(1, Math.floor(stats.balance / 500000) + 1);
  const nextLevelNeed = level * 500000;
  const levelProgress = clamp(Math.round((stats.balance / nextLevelNeed) * 100), 0, 100);

  return `
    <div class="saving-vault ${stats.financialMood.className}">
      <div>
        <p class="eyebrow">SAVING VAULT</p>
        <h3>💎 Vault LV${level}</h3>
        <p class="muted">Còn ${formatMoney(Math.max(0, nextLevelNeed - stats.balance))} để lên cấp tiếp theo.</p>
      </div>

      <div class="vault-core">
        <strong>${levelProgress}%</strong>
        <span>LV${level}</span>
      </div>

      <div class="saving-progress vault-progress">
        <span style="width:${levelProgress}%"></span>
      </div>
    </div>
  `;
}

function renderSavingMission(stats) {
  return `
    <div class="saving-mission-card ${stats.missionDoneToday ? "done" : ""}">
      <div>
        <p class="eyebrow">DAILY FINANCIAL MISSION</p>
        <h3>${stats.missionDoneToday ? "✅" : "🎮"} ${escapeHTML(stats.mission.title)}</h3>
        <p class="muted">${escapeHTML(stats.mission.desc)} • ${escapeHTML(stats.mission.reward)}</p>
      </div>

      <button
        class="${stats.missionDoneToday ? "ghost-btn" : "primary-btn"}"
        data-action="complete-saving-mission"
        ${stats.missionDoneToday ? "disabled" : ""}
      >
        ${stats.missionDoneToday ? "Đã hoàn thành" : "Hoàn thành mission"}
      </button>
    </div>
  `;
}

function renderSavingAchievements(stats) {
  return `
    <div class="achievement-grid">
      ${stats.achievements
        .map(
          (item) => `
            <div class="achievement-card ${item.unlocked ? "unlocked" : "locked"}">
              <strong>${item.icon}</strong>
              <span>${escapeHTML(item.title)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderSubscriptionTracker(stats) {
  return `
    <div class="list">
      ${stats.subscriptions.length
        ? stats.subscriptions
            .slice(0, 4)
            .map(
              (sub) => `
                <div class="mini-note">
                  <div>
                    <strong>${escapeHTML(sub.name)}</strong>
                    <p class="muted">Ngày ${sub.dueDay} hằng tháng ${sub.note ? "• " + escapeHTML(sub.note) : ""}</p>
                  </div>
                  <strong>${formatMoney(sub.amount)}</strong>
                </div>
              `,
            )
            .join("")
        : `<p class="muted">Chưa có subscription nào. Thêm Netflix, Spotify, hosting, domain...</p>`}
    </div>
  `;
}

function renderMonthReplay(stats) {
  const message =
    stats.monthNet >= 0
      ? `Tháng này bạn đang dương ${formatMoney(stats.monthNet)}. Nhịp tiết kiệm khá ổn.`
      : `Tháng này bạn đang âm ${formatMoney(Math.abs(stats.monthNet))}. Nên bật No-Spend Mode vài ngày.`;

  return `
    <div class="money-replay">
      <p class="eyebrow">MONEY REPLAY</p>
      <h3>🎬 Recap tháng ${stats.monthKey}</h3>
      <p>${escapeHTML(message)}</p>
      <div class="replay-grid">
        <span>Top chi: <strong>${escapeHTML(stats.topSpendingCategory.name)}</strong></span>
        <span>Forecast: <strong>${formatMoney(stats.monthProjectedNet)}</strong></span>
        <span>90 ngày: <strong>${formatMoney(stats.simulation90Days)}</strong></span>
      </div>
    </div>
  `;
}

function renderSaving() {
  const saving = getPersonalSavingStats();
  const filtered = getFilteredSavingTransactions();

  setContent(`
    <div class="grid financial-os ${saving.noSpendActive ? "no-spend-active" : ""}">
      <div class="card hero small-hero financial-hero">
        <p class="eyebrow">FINANCIAL OPERATING SYSTEM • ${escapeHTML(saving.financialMood.label)}</p>
        <h2>${saving.financialMood.icon} Tiết kiệm cá nhân</h2>
        <p>Quản lý quỹ tiết kiệm như một hệ điều hành tài chính: score, heatmap, mission, achievement, subscription, forecast và cảnh báo nguy hiểm.</p>
      </div>

      <div class="grid grid-4">
        ${statCard("💰 Số dư", formatMoney(saving.balance), "Tổng thêm - tổng rút", saving.balance < 0 ? "danger-text" : "success-text")}
        ${statCard("🧠 Saving Score", `${saving.savingScore}/100`, `${saving.financialMood.icon} ${saving.financialMood.label}`)}
        ${statCard("🎯 Mục tiêu", `${saving.goalProgress}%`, `Cần ${formatMoney(saving.targetDailyNeed)}/ngày`)}
        ${statCard("🔥 Burn-rate", saving.burnDaysLeft >= 999 ? "∞" : `${saving.burnDaysLeft} ngày`, `TB rút/ngày: ${formatMoney(saving.dailyAverageWithdraw)}`)}
      </div>

      ${renderSavingVault(saving)}
      ${renderSavingMission(saving)}

      <div class="grid grid-2">
        <div class="card">
          <div class="section-head">
            <div>
              <h3>🤖 Financial Advisor</h3>
              <p class="muted">Phân tích tự động từ dòng tiền, mục tiêu và thói quen chi tiêu.</p>
            </div>
            <span class="badge ${saving.financialMood.className === "danger" ? "red" : saving.financialMood.className === "warning" ? "yellow" : "green"}">
              ${escapeHTML(saving.financialMood.label)}
            </span>
          </div>

          ${renderAssistantCard(saving.advice)}

          <div class="list">
            ${renderMiniMetric("Net tháng này", formatMoney(saving.monthNet), `Dự phóng: ${formatMoney(saving.monthProjectedNet)}`)}
            ${renderMiniMetric("Top spending", saving.topSpendingCategory.name, formatMoney(saving.topSpendingCategory.withdraw))}
            ${renderMiniMetric("Subscription/tháng", formatMoney(saving.monthlySubscriptions), saving.nextSubscription ? `Gần nhất: ${saving.nextSubscription.name} còn ${saving.nextSubscription.left} ngày` : "Chưa có")}
          </div>

          <div class="tool-row">
            <button class="primary-btn" data-action="toggle-no-spend">
              ${saving.noSpendActive ? "Tắt No-Spend" : "Bật No-Spend 3 ngày"}
            </button>
            <button class="ghost-btn" data-action="set-saving-lock">Khóa quỹ</button>
          </div>
        </div>

        <div class="card">
          <div class="section-head">
            <div>
              <h3>🔥 Financial Heatmap</h3>
              <p class="muted">35 ngày gần nhất: xanh là dương, đỏ là rút tiền.</p>
            </div>
          </div>
          ${renderFinancialHeatmap()}
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="section-head">
            <div>
              <h3>📊 Spending Categories</h3>
              <p class="muted">Tự nhận diện category từ ghi chú giao dịch.</p>
            </div>
          </div>
          ${renderCategoryRadar(saving)}
        </div>

        <div class="card">
          <div class="section-head">
            <div>
              <h3>📈 6-Month Timeline</h3>
              <p class="muted">Dòng tiền net theo tháng.</p>
            </div>
          </div>
          ${renderSavingTimelineChart()}
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="section-head">
            <div>
              <h3>🏆 Achievement System</h3>
              <p class="muted">${saving.unlockedAchievements}/${saving.achievements.length} thành tựu đã mở khóa.</p>
            </div>
          </div>
          ${renderSavingAchievements(saving)}
        </div>

        <div class="card">
          <div class="section-head">
            <div>
              <h3>💳 Subscription Tracker</h3>
              <p class="muted">Theo dõi chi phí lặp lại như Spotify, domain, hosting...</p>
            </div>
            <button class="primary-btn" data-action="add-subscription">+ Sub</button>
          </div>
          ${renderSubscriptionTracker(saving)}
        </div>
      </div>

      ${renderMonthReplay(saving)}

      <div class="card">
        <div class="section-head">
          <div>
            <h3>⚡ Thao tác nhanh</h3>
            <p class="muted">Thêm/rút nhanh các khoản thường dùng.</p>
          </div>
        </div>

        <div class="quick-saving-actions">
          <button class="primary-btn" data-action="quick-saving" data-type="deposit" data-amount="10000">+10K</button>
          <button class="primary-btn" data-action="quick-saving" data-type="deposit" data-amount="20000">+20K</button>
          <button class="primary-btn" data-action="quick-saving" data-type="deposit" data-amount="50000">+50K</button>
          <button class="primary-btn" data-action="quick-saving" data-type="deposit" data-amount="100000">+100K</button>
          <button class="ghost-btn" data-action="quick-saving" data-type="withdraw" data-amount="5000">-5K</button>
          <button class="ghost-btn" data-action="quick-saving" data-type="withdraw" data-amount="10000">-10K</button>
        </div>
      </div>

      <div class="card form-card">
        <h3>➕ Thêm giao dịch</h3>

        <form id="savingForm">
          <div class="grid grid-2">
            <label>
              Loại giao dịch
              <select id="savingType">
                <option value="deposit">Thêm tiền</option>
                <option value="withdraw">Rút tiền</option>
              </select>
            </label>

            <label>
              Số tiền
              <input id="savingAmount" type="number" min="1000" step="1000" placeholder="VD: 10000" required />
            </label>
          </div>

          <div class="grid grid-2">
            <label>
              Ngày
              <input id="savingDate" type="date" required />
            </label>

            <label>
              Category
              <select id="savingCategory">
                <option value="">Tự nhận diện</option>
                <option value="Food">Food</option>
                <option value="Bills">Bills</option>
                <option value="Transport">Transport</option>
                <option value="Learning">Learning</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Tech">Tech</option>
                <option value="Emergency">Emergency</option>
                <option value="Saving">Saving</option>
                <option value="Income">Income</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <label>
            Ghi chú
            <textarea id="savingNote" placeholder="VD: ăn lẩu 220k, bỏ ống heo, Spotify, domain..."></textarea>
          </label>

          <div class="modal-actions">
            <button type="reset" class="ghost-btn">Reset</button>
            <button type="submit" class="primary-btn">Lưu giao dịch</button>
          </div>
        </form>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>🧾 Lịch sử giao dịch</h3>
            <p class="muted">${filtered.length} giao dịch đang hiển thị.</p>
          </div>

          <div class="saving-filters">
            <button class="mini-btn" data-action="filter-saving" data-filter="all">Tất cả</button>
            <button class="mini-btn" data-action="filter-saving" data-filter="deposit">Thêm</button>
            <button class="mini-btn" data-action="filter-saving" data-filter="withdraw">Rút</button>
            <button class="mini-btn" data-action="filter-saving" data-filter="edited">Đã sửa</button>
            <button class="mini-btn" data-action="filter-saving" data-filter="deleted">Đã xóa mềm</button>
          </div>
        </div>

        <div class="list">
          ${
            filtered.length
              ? filtered.map(renderSavingTransaction).join("")
              : `<p class="muted">Chưa có giao dịch nào.</p>`
          }
        </div>
      </div>
    </div>
  `);

  initSavingForm();
}

function getFilteredSavingTransactions() {
  const filter = store.data.personalSaving?.filter || "all";
  const allTransactions = store.data.personalSaving?.transactions || [];

  let list =
    filter === "deleted"
      ? allTransactions.filter((tx) => tx.deleted)
      : allTransactions.filter((tx) => !tx.deleted);

  if (filter === "deposit") list = list.filter((tx) => tx.type === "deposit");
  if (filter === "withdraw") list = list.filter((tx) => tx.type === "withdraw");
  if (filter === "edited") list = list.filter((tx) => tx.editedAt);

  return list.sort((a, b) =>
    String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
  );
}

function renderSavingTransaction(tx) {
  const isDeposit = tx.type === "deposit";
  const category = tx.category || inferSavingCategory(tx.note, tx.type);
  const mood = tx.mood || inferSavingMood(tx.note, tx.type, tx.amount);

  return `
    <div class="item saving-transaction ${tx.deleted ? "saving-deleted" : ""}">
      <div>
        <strong class="${isDeposit ? "success-text" : "danger-text"}">
          ${isDeposit ? "+" : "-"}${formatMoney(tx.amount)}
        </strong>

        <p class="muted">
          ${isDeposit ? "📥 Thêm tiền" : "📤 Rút tiền"}
          • ${formatDate(tx.date)}
          • ${escapeHTML(category)}
          • mood: ${escapeHTML(mood)}
          ${tx.note ? " • " + escapeHTML(tx.note) : ""}
          ${tx.editedAt ? " • Đã sửa" : ""}
          ${tx.deleted ? " • Đã xóa mềm" : ""}
        </p>
      </div>

      <div class="item-actions">
        ${
          tx.deleted
            ? `
              <button class="mini-btn" data-action="restore-saving-tx" data-id="${escapeAttr(tx.id)}">Khôi phục</button>
              <button class="mini-btn danger" data-action="hard-delete-saving-tx" data-id="${escapeAttr(tx.id)}">Xóa hẳn</button>
            `
            : `
              <button class="mini-btn" data-action="edit-saving-tx" data-id="${escapeAttr(tx.id)}">Sửa</button>
              <button class="mini-btn danger" data-action="soft-delete-saving-tx" data-id="${escapeAttr(tx.id)}">Xóa</button>
            `
        }
      </div>
    </div>
  `;
}

function initSavingForm() {
  const form = $("savingForm");
  const typeInput = $("savingType");
  const amountInput = $("savingAmount");
  const dateInput = $("savingDate");
  const noteInput = $("savingNote");
  const categoryInput = $("savingCategory");

  if (!form || !typeInput || !amountInput || !dateInput || !noteInput) return;

  dateInput.value = today();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    addSavingTransaction({
      type: typeInput.value,
      amount: Number(amountInput.value || 0),
      date: dateInput.value,
      note: noteInput.value.trim(),
      category: categoryInput?.value || "",
    });

    form.reset();
    dateInput.value = today();
  });
}

function getSavingBalance() {
  const transactions = store.data.personalSaving?.transactions || [];

  return transactions
    .filter((tx) => !tx.deleted)
    .reduce((balance, tx) => {
      if (tx.type === "deposit") return balance + Number(tx.amount || 0);
      return balance - Number(tx.amount || 0);
    }, 0);
}

function addSavingTransaction({ type, amount, date = today(), note = "", category = "" }) {
  if (!amount || amount <= 0) {
    showToast("Số tiền không hợp lệ");
    return;
  }

  const balance = getSavingBalance();

  if (type === "withdraw") {
    const saving = getPersonalSavingStats();

    if (saving.isLocked) {
      const ok = confirm(
        `Quỹ đang khóa đến ${formatDate(saving.lockUntil)}. Bạn vẫn muốn rút?`,
      );
      if (!ok) return;
    }

    if (saving.noSpendActive) {
      const ok = confirm(
        "🥷 No-Spend Mode đang bật. Khoản rút này có thể phá mission hôm nay. Vẫn rút?",
      );
      if (!ok) return;
    }

    if (amount > balance) {
      showToast("Không đủ số dư để rút 😭");
      return;
    }

    const ok = confirm(`Rút ${formatMoney(amount)} khỏi quỹ tiết kiệm?`);
    if (!ok) return;
  }

  const finalCategory = category || inferSavingCategory(note, type);

  const tx = normalizeSavingTransaction({
    type,
    amount,
    date,
    note,
    category: finalCategory,
    mood: inferSavingMood(note, type, amount),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  commit(
    (data) => {
      data.personalSaving.transactions.unshift(tx);
    },
    {
      activity: {
        action:
          type === "deposit" ? "Thêm tiền tiết kiệm" : "Rút tiền tiết kiệm",
        detail: `${formatMoney(amount)} • ${finalCategory} • ${note || formatDate(date)}`,
      },
      toast: type === "deposit" ? "Đã thêm tiền ✅" : "Đã rút tiền ✅",
    },
  );
}

function quickSaving(type, amount) {
  addSavingTransaction({
    type,
    amount: Number(amount),
    date: today(),
    note: type === "deposit" ? "Thêm nhanh" : "Rút nhanh",
  });
}

function editSavingTransaction(id) {
  const tx = store.data.personalSaving.transactions.find(
    (item) => item.id === id,
  );
  if (!tx || tx.deleted) return;

  const nextAmount = Number(prompt("Số tiền mới:", tx.amount));
  if (!nextAmount || nextAmount <= 0) return;

  const nextNote = prompt("Ghi chú mới:", tx.note || "") ?? tx.note;
  const nextCategory = prompt("Category:", tx.category || inferSavingCategory(tx.note, tx.type)) || tx.category;

  if (tx.type === "withdraw") {
    const balanceWithoutThis = getSavingBalance() + Number(tx.amount || 0);

    if (nextAmount > balanceWithoutThis) {
      showToast("Không đủ số dư nếu sửa khoản rút này 😭");
      return;
    }
  }

  commit(
    (data) => {
      data.personalSaving.transactions = data.personalSaving.transactions.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                originalAmount: item.originalAmount ?? item.amount,
                amount: nextAmount,
                note: nextNote.trim(),
                category: nextCategory,
                mood: inferSavingMood(nextNote, item.type, nextAmount),
                editedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : item,
      );
    },
    {
      activity: {
        action: "Sửa giao dịch tiết kiệm",
        detail: `${formatMoney(nextAmount)}`,
      },
      toast: "Đã sửa giao dịch ✅",
    },
  );
}

function softDeleteSavingTransaction(id) {
  const tx = store.data.personalSaving.transactions.find(
    (item) => item.id === id,
  );
  if (!tx) return;

  const ok = confirm("Xóa mềm giao dịch này? Có thể khôi phục sau.");
  if (!ok) return;

  commit(
    (data) => {
      data.personalSaving.transactions = data.personalSaving.transactions.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                deleted: true,
                updatedAt: new Date().toISOString(),
              }
            : item,
      );
    },
    {
      activity: {
        action: "Xóa mềm giao dịch tiết kiệm",
        detail: `${formatMoney(tx.amount)}`,
      },
      toast: "Đã xóa mềm giao dịch",
    },
  );
}

function restoreSavingTransaction(id) {
  commit(
    (data) => {
      data.personalSaving.transactions = data.personalSaving.transactions.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                deleted: false,
                updatedAt: new Date().toISOString(),
              }
            : item,
      );
    },
    {
      activity: {
        action: "Khôi phục giao dịch tiết kiệm",
        detail: id,
      },
      toast: "Đã khôi phục giao dịch ✅",
    },
  );
}

function hardDeleteSavingTransaction(id) {
  const ok = confirm("Xóa vĩnh viễn giao dịch này?");
  if (!ok) return;

  commit(
    (data) => {
      data.personalSaving.transactions =
        data.personalSaving.transactions.filter((item) => item.id !== id);
    },
    {
      activity: {
        action: "Xóa vĩnh viễn giao dịch tiết kiệm",
        detail: id,
      },
      toast: "Đã xóa vĩnh viễn",
    },
  );
}

function filterSavingTransactions(filter) {
  commit(
    (data) => {
      data.personalSaving.filter = filter || "all";
    },
    {
      render: true,
    },
  );
}

function setSavingGoal() {
  const current = store.data.personalSaving?.monthlyGoal || 0;
  const value = Number(prompt("Nhập mục tiêu tiết kiệm tháng này:", current));

  if (Number.isNaN(value) || value < 0) return;

  commit(
    (data) => {
      data.personalSaving.monthlyGoal = value;
    },
    {
      activity: {
        action: "Cập nhật mục tiêu tiết kiệm",
        detail: formatMoney(value),
      },
      toast: "Đã cập nhật mục tiêu tháng ✅",
    },
  );
}

function setSavingLock() {
  const date = prompt("Khóa quỹ đến ngày nào? Nhập dạng YYYY-MM-DD", today());
  if (!date) return;

  commit(
    (data) => {
      data.personalSaving.lockUntil = date;
    },
    {
      activity: {
        action: "Khóa quỹ tiết kiệm",
        detail: date,
      },
      toast: `Đã khóa quỹ đến ${date}`,
    },
  );
}

function toggleNoSpendMode() {
  const saving = store.data.personalSaving || {};
  const active = Boolean(
    saving.noSpendUntil &&
      new Date(`${saving.noSpendUntil}T23:59:59`).getTime() >= Date.now(),
  );

  commit(
    (data) => {
      if (active) {
        data.personalSaving.noSpendUntil = "";
        data.personalSaving.noSpendReason = "";
      } else {
        data.personalSaving.noSpendUntil = addDays(today(), 2);
        data.personalSaving.noSpendReason = "No-Spend Mode 3 ngày";
      }
    },
    {
      activity: {
        action: active ? "Tắt No-Spend Mode" : "Bật No-Spend Mode",
        detail: active ? "OFF" : "3 ngày",
      },
      toast: active ? "Đã tắt No-Spend Mode" : "Đã bật No-Spend Mode 🥷",
    },
  );
}

function completeSavingMission() {
  const mission = getCurrentDailyMission();

  commit(
    (data) => {
      if (!data.personalSaving.missionLog) data.personalSaving.missionLog = {};
      if (!data.personalSaving.missionLog[today()]) data.personalSaving.missionLog[today()] = {};

      data.personalSaving.missionLog[today()][mission.id] = {
        done: true,
        at: new Date().toISOString(),
      };
    },
    {
      activity: {
        action: "Hoàn thành financial mission",
        detail: mission.title,
      },
      toast: "Mission hoàn thành ⚡",
    },
  );
}

function addSubscription() {
  const name = prompt("Tên subscription? VD: Spotify, Netflix, Domain");
  if (!name) return;

  const amount = Number(prompt("Số tiền mỗi tháng?", "59000"));
  if (!amount || amount <= 0) return;

  const dueDay = Number(prompt("Ngày thanh toán hằng tháng? 1-31", "1")) || 1;
  const note = prompt("Ghi chú:", "") || "";

  commit(
    (data) => {
      if (!Array.isArray(data.personalSaving.subscriptions)) {
        data.personalSaving.subscriptions = [];
      }

      data.personalSaving.subscriptions.unshift({
        id: uid(),
        name: name.trim(),
        amount,
        dueDay: clamp(dueDay, 1, 31),
        note,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    {
      activity: {
        action: "Thêm subscription",
        detail: `${name} • ${formatMoney(amount)}`,
      },
      toast: "Đã thêm subscription 💳",
    },
  );
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

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
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
    addActivity(
      runtime.currentLang === "vi" ? "Import dữ liệu" : "Import data",
      file.name,
    );
    invalidateAnalytics();
    saveLocal();
    markDirty();
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
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;

  const due = getDueItems(1);
  const kh2Passed = Boolean(store.data.kh2Daily?.[today()]?.saved);

  let body =
    runtime.currentLang === "vi"
      ? "Không có deadline gấp hôm nay."
      : "No urgent deadlines today.";

  if (due.length) {
    body =
      runtime.currentLang === "vi"
        ? `Bạn có ${due.length} mục cần chú ý.`
        : `You have ${due.length} urgent items.`;
  } else if (!kh2Passed) {
    body =
      runtime.currentLang === "vi"
        ? "KH2 hôm nay chưa PASS."
        : "KH2 has not passed today.";
  }

  new Notification("PlanOS", { body });
}
function checkKh1BrowserReminders() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();

  const next15 = new Date(now.getTime() + 15 * 60 * 1000);

  store.data.kh1.forEach((task) => {
    if (!task.datetime) return;
    if (task.status === STATUS.done) return;
    if (task.browserAlertSent) return;

    const deadline = new Date(task.datetime);

    if (Number.isNaN(deadline.getTime())) return;

    const shouldNotify = deadline >= now && deadline <= next15;

    if (!shouldNotify) return;

    new Notification("📚 PlanOS Reminder", {
      body: `${task.name} sắp tới giờ lúc ${deadline.toLocaleTimeString("vi-VN")}`,
      icon: "./assets/images/logo.png",
    });

    task.browserAlertSent = true;
    task.browserAlertSentAt = new Date().toISOString();

    saveLocal();
    markDirty();
    scheduleCloudSave(1200);
  });
}
function manualSave() {
  if (runtime.lastSavedVersion === runtime.dirtyVersion) {
    runtime.dirtyVersion += 1;
  }

  markDirty();
  saveCloud(true);
}

function manualLoad() {
  loadCloud(true, { force: true });
}

/* =========================================================
   ROUTER
========================================================= */

const pageRenderers = {
  dashboard: renderDashboard,
  calendar: renderCalendar,
  kanban: renderKanban,
  insights: renderInsights,
  saving: renderSaving,
  settings: renderSettings,
};

function loadPage(pageName) {
  if (!pageInfo[pageName]) pageName = "dashboard";

  runtime.currentPage = pageName;
  if (dom.pageTitle) dom.pageTitle.textContent = t(pageName);

  dom.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  if (runtime.searchQuery.trim()) {
    renderGlobalSearchResults();
    applyLanguage();
    return;
  }

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
    "toggle-kh6-paid": () => toggleKh6Paid(id),
    "edit-item": () => openEditModal(group, id),
    "delete-item": () => deleteItem(group, id),
    "move-item": () => moveItem(group, id, status),
    "select-kh2-date": () => selectKh2Date(date),
    "delete-kh2-day": () => deleteKh2HistoryDay(date),
    "kh2-smart-topup": () => {
      const input = $("kh2TopupAmount");
      const amount = Number(input?.value || 0);

      autoTopupKh2(amount);

      if (input) {
        input.value = "";
      }
    },
    "export-data": () => exportData(),
    "import-data": () => triggerImport(),
    "request-notifications": () => requestNotifications(),
    "manual-save": () => manualSave(),
    "manual-load": () => manualLoad(),
    "edit-kh1-todo": () => editKh1Todo(id),
    "delete-kh1-todo": () => deleteKh1Todo(id),

    // Personal Saving actions
    "quick-saving": () =>
      quickSaving(target.dataset.type, target.dataset.amount),
    "edit-saving-tx": () => editSavingTransaction(id),
    "soft-delete-saving-tx": () => softDeleteSavingTransaction(id),
    "restore-saving-tx": () => restoreSavingTransaction(id),
    "hard-delete-saving-tx": () => hardDeleteSavingTransaction(id),
    "filter-saving": () => filterSavingTransactions(target.dataset.filter),
    "set-saving-goal": () => setSavingGoal(),
    "set-saving-lock": () => setSavingLock(),
    "toggle-no-spend": () => toggleNoSpendMode(),
    "complete-saving-mission": () => completeSavingMission(),
    "add-subscription": () => addSubscription(),

    "clear-search": () => {
      runtime.searchQuery = "";
      if (dom.globalSearch) dom.globalSearch.value = "";
      loadPage(runtime.currentPage);
    },
    "open-search-page": () => {
      const page = target.dataset.page;

      runtime.searchQuery = "";

      if (dom.globalSearch) {
        dom.globalSearch.value = "";
      }

      loadPage(page);
    },
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
    runtime.searchQuery = value.trim();
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

  window.addEventListener("online", () => {
    showToast("Đã có mạng lại. Đang sync cloud...");
    setSyncStatus("pending");
    scheduleCloudSave(300);
    syncFromCloudIfNewer();
  });

  window.addEventListener("offline", () => {
    setSyncStatus("offline", "Offline: dữ liệu vẫn được lưu local.");
    showToast("Mất mạng. Dữ liệu vẫn lưu local.");
  });

  window.addEventListener("beforeunload", () => {
    saveLocal();

    if (runtime.saveTimer) {
      clearTimeout(runtime.saveTimer);
    }

    if (runtime.dirtyVersion !== runtime.lastSavedVersion) {
      saveCloud(false);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveLocal();

      if (runtime.dirtyVersion !== runtime.lastSavedVersion) {
        saveCloud(false);
      }
    }

    if (document.visibilityState === "visible") {
      syncFromCloudIfNewer();
    }
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

  clock.textContent = now.toLocaleTimeString(
    runtime.currentLang === "vi" ? "vi-VN" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  );

  dateEl.textContent = now.toLocaleDateString(
    runtime.currentLang === "vi" ? "vi-VN" : "en-US",
    {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

async function initApp() {
  bindEvents();
  initClickEffects();
  applyThemeFromStorage();
  initMusicWidget();
  const isLoggedIn = checkLogin();

  if (isLoggedIn) {
    await bootFromCloud();
  }

  updateRealTimeClock();

  runtime.clockTimer = setInterval(updateRealTimeClock, 1000);

  setInterval(checkKh1BrowserReminders, 60 * 1000);

  runtime.backgroundSyncTimer = setInterval(() => {
    syncFromCloudIfNewer();
  }, 20 * 1000);

  checkKh1BrowserReminders();

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
  renderSaving,
  addSavingTransaction,
  quickSaving,
  editSavingTransaction,
  softDeleteSavingTransaction,
  restoreSavingTransaction,
  hardDeleteSavingTransaction,
  filterSavingTransactions,
  setSavingGoal,
  setSavingLock,
  syncFromCloudIfNewer,
  autoTopupKh2,
});
/* =========================================================
   GLOBAL CLICK EFFECTS
========================================================= */

function initClickEffects() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
  if (runtime.clickEffectsReady) return;
  runtime.clickEffectsReady = true;

  const colors = [
    "#22d3ee",
    "#8b5cf6",
    "#38bdf8",
    "#f472b6",
    "#facc15",
    "#4ade80",
    "#fb7185",
  ];

  function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createClickFx(x, y) {
    const color = randomColor();

    const dot = document.createElement("div");
    dot.className = "click-fx-dot";
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.background = color;
    dot.style.boxShadow = `0 0 20px ${color}, 0 0 60px ${color}`;
    document.body.appendChild(dot);

    const ring = document.createElement("div");
    ring.className = "click-fx-ring";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.color = color;
    document.body.appendChild(ring);

    for (let i = 0; i < 12; i += 1) {
      const particle = document.createElement("div");
      particle.className = "click-fx-particle";

      const angle = (Math.PI * 2 * i) / 12;
      const distance = 35 + Math.random() * 55;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = color;
      particle.style.boxShadow = `0 0 14px ${color}`;
      particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 900);
    }

    setTimeout(() => dot.remove(), 700);
    setTimeout(() => ring.remove(), 800);
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button && event.button !== 0) return;

      if (
        event.target.closest("input") ||
        event.target.closest("textarea") ||
        event.target.closest("select")
      ) {
        return;
      }

      createClickFx(event.clientX, event.clientY);
    },
    { passive: true },
  );
}

/* =========================================================
   KH2 SMART AUTO TOPUP
========================================================= */

function autoTopupKh2(amount) {
  const daily = CONFIG.dailySaving || 15000;

  const normalizedAmount = Number(amount || 0);

  if (!normalizedAmount || normalizedAmount <= 0) {
    showToast("Số tiền bù không hợp lệ");
    return;
  }

  const daysToFill = Math.floor(normalizedAmount / daily);
  const leftover = normalizedAmount % daily;

  if (daysToFill <= 0) {
    showToast(`Chưa đủ ${formatMoney(daily)} để bù 1 ngày`);
    return;
  }

  const filledDates = [];

  commit(
    (data) => {
      if (!data.kh2Daily) {
        data.kh2Daily = {};
      }

      let filled = 0;

      for (let i = 0; i < CONFIG.heatmapDays && filled < daysToFill; i += 1) {
        const date = addDays(today(), -i);

        const current = data.kh2Daily[date] || {};

        if (!current.saved) {
          data.kh2Daily[date] = {
            ...current,
            saved: true,
            deposit: CONFIG.dailySaving,
            withdraw: Math.max(0, Number(current.withdraw || 0)),
            note: current.note
              ? `${current.note} • Bù tự động ${formatMoney(normalizedAmount)}`
              : `Bù tự động ${formatMoney(normalizedAmount)}`,
            autoFilled: true,
            updatedAt: new Date().toISOString(),
          };

          filled += 1;
          filledDates.push(date);
        }
      }
    },
    {
      activity: {
        action: "Bù quỹ KH2 tự động",
        detail: `${formatMoney(normalizedAmount)} → ${filledDates.length} ngày`,
      },

      toast:
        `Đã bù ${filledDates.length} ngày` +
        (leftover ? ` • dư ${formatMoney(leftover)}` : "") +
        ` ✅`,
    },
  );

  return {
    filledDays: filledDates.length,
    leftover,
    dates: filledDates,
  };
}

initApp();
