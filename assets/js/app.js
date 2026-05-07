import {
  saveDataToCloud,
  loadDataFromCloud
} from "./firebase.js";

/* =========================
   CONFIG
========================= */

const LOGIN_USERNAME = "danhcr6sdd";
const LOGIN_PASSWORD = "thanhdanh7777";
const DAILY_SAVING = 15000;
const STORAGE_KEY = "planosData";
const LOGIN_KEY = "planosLoggedIn";

let currentPage = "dashboard";
let saveTimer = null;
let isCloudSaving = false;

const defaultData = {
  kh1: [],
  kh2: [],
  kh3: [],
  kh4: [],
  kh5: [],
  kh6: [],
  kh2Daily: {}
};

const pageInfo = {
  dashboard: { title: "Tổng quan kế hoạch" },
  kh1: { title: "KH1 - Học tập", icon: "📚", desc: "Môn học, deadline, đồ án, bài tập." },
  kh2: { title: "KH2 - Tiết kiệm 15K/ngày", icon: "💰", desc: "Theo dõi PASS, rút quỹ, ghi chú từng ngày." },
  kh3: { title: "KH3 - Dự phòng", icon: "🧩", desc: "Không gian mở cho mục tiêu mới." },
  kh4: { title: "KH4 - Wishlist sách", icon: "📖", desc: "Sách muốn mua, đang đọc, đã đọc." },
  kh5: { title: "KH5 - Góp laptop", icon: "💻", desc: "Theo dõi kỳ góp laptop." },
  kh6: { title: "KH6 - Góp MoMo", icon: "💳", desc: "Theo dõi các kỳ góp MoMo." }
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

const loginScreen = $("loginScreen");
const loginForm = $("loginForm");
const loginUsername = $("loginUsername");
const loginPassword = $("loginPassword");
const loginError = $("loginError");
const logoutBtn = $("logoutBtn");

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
    kh2Daily: safe.kh2Daily || safe.kh2Data || {}
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
      savedAt: new Date().toISOString()
    });

    if (showMessage) showToast("Đã lưu cloud ☁️");
  } catch (error) {
    console.error("Firebase save error:", error);
    if (showMessage) showToast("Lỗi lưu cloud 😭");
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
  return crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
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

function badgeClass(status) {
  if (status === "Xong") return "green";
  if (status === "Quan trọng") return "red";
  return "yellow";
}

function getGroupKeys() {
  return ["kh1", "kh2", "kh3", "kh4", "kh5", "kh6"];
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
    showToast("Đăng nhập thành công 🔐");
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
  const totalWithdraw = records.reduce((sum, day) => sum + Number(day.withdraw || 0), 0);

  return {
    passDays,
    totalSaved,
    totalWithdraw,
    balance: totalSaved - totalWithdraw
  };
}

function getAllItems() {
  return getGroupKeys().flatMap((key) =>
    appData[key].map((item) => ({
      ...item,
      group: key
    }))
  );
}

/* =========================
   RENDER
========================= */

function renderDashboard() {
  const stats = getKh2Stats();
  const allItems = getAllItems();
  const importantItems = allItems.filter((item) => item.status === "Quan trọng").length;
  const doneItems = allItems.filter((item) => item.status === "Xong").length;

  content.innerHTML = `
    <div class="grid">
      <div class="card hero">
        <h2>Personal Plan Dashboard ✨</h2>
        <p>
          Trung tâm quản lý KH1 đến KH6. Mỗi kế hoạch đều có thêm, sửa, xóa
          và tự động lưu Firebase Cloud.
        </p>
      </div>

      <div class="grid grid-4">
        <div class="card">
          <h3>📦 Tổng item</h3>
          <p class="big">${allItems.length}</p>
          <p class="muted">Toàn hệ thống</p>
        </div>

        <div class="card">
          <h3>✅ Đã xong</h3>
          <p class="big">${doneItems}</p>
          <p class="muted">Mục hoàn thành</p>
        </div>

        <div class="card">
          <h3>🔥 Quan trọng</h3>
          <p class="big">${importantItems}</p>
          <p class="muted">Cần ưu tiên</p>
        </div>

        <div class="card">
          <h3>💰 KH2 Số dư</h3>
          <p class="big ${stats.balance < 0 ? "danger-text" : "success-text"}">
            ${formatMoney(stats.balance)}
          </p>
          <p class="muted">Đã thêm - đã rút</p>
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Tất cả kế hoạch gần đây</h3>
            <p class="muted">Dữ liệu từ KH1 đến KH6.</p>
          </div>

          <button class="primary-btn" onclick="openAddModal('kh1')">
            + Thêm kế hoạch
          </button>
        </div>

        <div class="list">
          ${
            allItems.length
              ? allItems.slice(-10).reverse().map(renderItem).join("")
              : `<p class="muted">Chưa có dữ liệu. Bấm + Thêm để bắt đầu.</p>`
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

  content.innerHTML = `
    <div class="grid">
      <div class="card hero small-hero">
        <h2>${info.icon} ${info.title}</h2>
        <p>${info.desc}</p>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Danh sách ${info.title}</h3>
            <p class="muted">Có đủ 3 chức năng: thêm, sửa, xóa.</p>
          </div>

          <button class="primary-btn" onclick="openAddModal('${key}')">
            + Thêm vào ${key.toUpperCase()}
          </button>
        </div>

        <div class="list">
          ${
            appData[key].length
              ? appData[key].map(renderItem).join("")
              : `<p class="muted">Chưa có mục nào trong ${key.toUpperCase()}.</p>`
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
          <h3>Tổng ngày PASS</h3>
          <p class="big">${stats.passDays}</p>
          <p class="muted">Ngày đã thêm 15K</p>
        </div>

        <div class="card">
          <h3>Tổng đã thêm</h3>
          <p class="big">${formatMoney(stats.totalSaved)}</p>
          <p class="muted">PASS × 15.000đ</p>
        </div>

        <div class="card">
          <h3>Tổng đã rút</h3>
          <p class="big">${formatMoney(stats.totalWithdraw)}</p>
          <p class="muted">Tiền lấy từ quỹ</p>
        </div>

        <div class="card">
          <h3>Số dư quỹ</h3>
          <p class="big ${stats.balance < 0 ? "danger-text" : "success-text"}">
            ${formatMoney(stats.balance)}
          </p>
          <p class="muted">Đã thêm - đã rút</p>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card form-card">
          <h3>Chọn ngày để cập nhật</h3>

          <label>
            Ngày cần xem / sửa
            <input type="date" id="kh2DateInput" />
          </label>

          <div class="checkbox-row">
            <input type="checkbox" id="kh2SavedInput" />
            <div>
              <strong>Đã thêm 15.000đ vào quỹ</strong>
              <p class="muted">Tick nếu ngày này đã PASS.</p>
            </div>
          </div>

          <label>
            Số tiền rút từ quỹ
            <input type="number" id="kh2WithdrawInput" min="0" placeholder="VD: 50000" />
          </label>

          <label>
            Ghi chú
            <textarea id="kh2NoteInput" placeholder="VD: ăn uống, đi học, mua đồ..."></textarea>
          </label>

          <div class="modal-actions">
            <button class="ghost-btn" id="kh2DeleteDayBtn">Xóa ngày này</button>
            <button class="primary-btn" id="kh2SaveDayBtn">Lưu ngày này</button>
          </div>
        </div>

        <div class="card">
          <h3>Tình trạng ngày đang chọn</h3>

          <div class="kh2-status">
            <div class="status-line"><span>Ngày</span><strong id="kh2SelectedDate">--</strong></div>
            <div class="status-line"><span>Đã thêm 15K?</span><strong id="kh2SelectedSaved">Chưa</strong></div>
            <div class="status-line"><span>Đã rút</span><strong id="kh2SelectedWithdraw">0đ</strong></div>
            <div class="status-line"><span>Ghi chú</span><strong id="kh2SelectedNote">Không có</strong></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Ghi chú / kế hoạch riêng của KH2</h3>
            <p class="muted">Phần này cũng có thêm, sửa, xóa như các KH khác.</p>
          </div>

          <button class="primary-btn" onclick="openAddModal('kh2')">
            + Thêm KH2
          </button>
        </div>

        <div class="list">
          ${
            appData.kh2.length
              ? appData.kh2.map(renderItem).join("")
              : `<p class="muted">Chưa có ghi chú riêng trong KH2.</p>`
          }
        </div>
      </div>

      <div class="card">
        <h3>Lịch sử ngày đã ghi</h3>
        <div class="list">${renderKh2History()}</div>
      </div>
    </div>
  `;

  initKh2Form();
}

function renderKh2History() {
  const entries = Object.entries(appData.kh2Daily || {}).sort((a, b) => b[0].localeCompare(a[0]));

  if (!entries.length) {
    return `<p class="muted">Chưa có ngày nào được ghi.</p>`;
  }

  return entries.map(([date, record]) => `
    <div class="item">
      <div>
        <strong>${escapeHTML(date)}</strong>
        <p class="muted">
          Rút: ${formatMoney(record.withdraw || 0)}
          ${record.note ? "• " + escapeHTML(record.note) : ""}
        </p>
      </div>

      <span class="badge ${record.saved ? "green" : "red"}">
        ${record.saved ? "PASS" : "Chưa PASS"}
      </span>
    </div>
  `).join("");
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
    const record = appData.kh2Daily[date] || { saved: false, withdraw: 0, note: "" };

    savedInput.checked = Boolean(record.saved);
    withdrawInput.value = record.withdraw || "";
    noteInput.value = record.note || "";

    $("kh2SelectedDate").textContent = date || "--";

    const selectedSaved = $("kh2SelectedSaved");
    selectedSaved.textContent = record.saved ? "Đã thêm 15K ✅" : "Chưa thêm ❌";
    selectedSaved.className = record.saved ? "success-text" : "danger-text";

    $("kh2SelectedWithdraw").textContent = formatMoney(record.withdraw || 0);
    $("kh2SelectedNote").textContent = record.note || "Không có";
  }

  dateInput.value = today();
  renderSelected();

  dateInput.addEventListener("change", renderSelected);

  saveBtn.addEventListener("click", () => {
    const date = dateInput.value;

    if (!date) {
      showToast("Bạn chưa chọn ngày 😭");
      return;
    }

    const withdraw = Number(withdrawInput.value || 0);

    if (withdraw < 0) {
      showToast("Số tiền rút không được âm 😭");
      return;
    }

    appData.kh2Daily[date] = {
      saved: savedInput.checked,
      withdraw,
      note: noteInput.value.trim(),
      updatedAt: new Date().toISOString()
    };

    saveAll();
    renderKh2();
    showToast("Đã lưu ngày này ✅");
  });

  deleteBtn.addEventListener("click", () => {
    const date = dateInput.value;

    if (!appData.kh2Daily[date]) {
      showToast("Ngày này chưa có dữ liệu 😭");
      return;
    }

    if (!confirm("Bạn chắc chắn muốn xóa dữ liệu ngày này?")) return;

    delete appData.kh2Daily[date];

    saveAll();
    renderKh2();
    showToast("Đã xóa ngày này 🗑");
  });
}

/* =========================
   CRUD ITEMS
========================= */

function renderItem(item) {
  const group = item.group || currentPage;

  return `
    <div class="item">
      <div>
        <strong>${escapeHTML(item.name)}</strong>
        <p class="muted">
          ${group.toUpperCase()}
          ${item.date ? "• " + escapeHTML(item.date) : ""}
          ${item.note ? "• " + escapeHTML(item.note) : ""}
        </p>
      </div>

      <div class="item-actions">
        <span class="badge ${badgeClass(item.status)}">
          ${escapeHTML(item.status || "Đang làm")}
        </span>

        <button class="mini-btn" onclick="openEditModal('${group}', '${item.id}')">Sửa</button>
        <button class="mini-btn danger" onclick="deleteItem('${group}', '${item.id}')">Xóa</button>
      </div>
    </div>
  `;
}

function openAddModal(type = currentPage === "dashboard" ? "kh1" : currentPage) {
  editId.value = "";
  modalMode.textContent = "New item";
  modalTitle.textContent = "Thêm kế hoạch";

  planType.value = type;
  planName.value = "";
  planDate.value = "";
  planStatus.value = "Đang làm";
  planNote.value = "";

  planModal.classList.add("show");
  planName.focus();
}

function openEditModal(type, id) {
  const item = appData[type]?.find((x) => x.id === id);

  if (!item) {
    showToast("Không tìm thấy mục cần sửa 😭");
    return;
  }

  editId.value = id;
  modalMode.textContent = "Edit item";
  modalTitle.textContent = "Sửa kế hoạch";

  planType.value = type;
  planName.value = item.name || "";
  planDate.value = item.date || "";
  planStatus.value = item.status || "Đang làm";
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
  if (!confirm("Bạn chắc chắn muốn xóa mục này?")) return;

  appData[type] = appData[type].filter((item) => item.id !== id);

  saveAll();
  loadPage(currentPage);
  showToast("Đã xóa 🗑");
}

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;

planForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const type = planType.value;
  const id = editId.value;
  const name = planName.value.trim();

  if (!name) {
    showToast("Bạn chưa nhập tiêu đề 😭");
    return;
  }

  const payload = {
    id: id || uid(),
    name,
    date: planDate.value,
    status: planStatus.value,
    note: planNote.value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (id) {
    appData[type] = appData[type].map((item) =>
      item.id === id ? { ...item, ...payload } : item
    );

    showToast("Đã sửa kế hoạch ✅");
  } else {
    appData[type].push({
      ...payload,
      createdAt: new Date().toISOString()
    });

    showToast("Đã thêm kế hoạch ✅");
  }

  saveAll();
  closeModal();
  loadPage(currentPage);
});

/* =========================
   PAGE NAVIGATION
========================= */

function loadPage(pageName) {
  if (!pageInfo[pageName]) pageName = "dashboard";

  currentPage = pageName;
  pageTitle.textContent = pageInfo[pageName].title;

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  pageName === "dashboard" ? renderDashboard() : renderKhPage(pageName);
}

/* =========================
   EVENTS
========================= */

navItems.forEach((item) => {
  item.addEventListener("click", () => loadPage(item.dataset.page));
});

themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("planosTheme", isLight ? "light" : "dark");
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
});

/* =========================
   CLOUD SYNC
========================= */

cloudSaveBtn?.addEventListener("click", () => saveCloud(true));

cloudLoadBtn?.addEventListener("click", async () => {
  await loadCloud(true);
});

async function loadCloud(showMessage = false) {
  try {
    const data = await loadDataFromCloud();

    if (!data) {
      if (showMessage) showToast("Cloud chưa có dữ liệu 😭");
      return false;
    }

    appData = normalizeData(data);
    saveLocal();
    loadPage(currentPage);

    if (showMessage) showToast("Đã tải cloud 🔄");
    return true;
  } catch (error) {
    console.error("Firebase load error:", error);
    if (showMessage) showToast("Lỗi tải cloud 😭");
    return false;
  }
}

/* =========================
   INIT
========================= */

async function initApp() {
  checkLogin();

  const savedTheme = localStorage.getItem("planosTheme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
    if (themeBtn) themeBtn.textContent = "☀️";
  }

  const loaded = await loadCloud(false);

  if (!loaded) {
    saveLocal();
  }

  loadPage("dashboard");
}

initApp();