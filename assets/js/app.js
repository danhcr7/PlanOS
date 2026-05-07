import {
  saveDataToCloud,
  loadDataFromCloud
} from "./firebase.js";

const DAILY_SAVING = 15000;

let currentPage = "dashboard";

let appData = JSON.parse(localStorage.getItem("planosData")) || {
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

const content = document.getElementById("content");
const pageTitle = document.getElementById("pageTitle");
const navItems = document.querySelectorAll(".nav-item");

const themeBtn = document.getElementById("themeBtn");
const addPlanBtn = document.getElementById("addPlanBtn");
const cloudSaveBtn = document.getElementById("cloudSaveBtn");
const cloudLoadBtn = document.getElementById("cloudLoadBtn");

const planModal = document.getElementById("planModal");
const modalMode = document.getElementById("modalMode");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const planForm = document.getElementById("planForm");

const editId = document.getElementById("editId");
const planType = document.getElementById("planType");
const planName = document.getElementById("planName");
const planDate = document.getElementById("planDate");
const planStatus = document.getElementById("planStatus");
const planNote = document.getElementById("planNote");
const toast = document.getElementById("toast");

function saveLocal() {
  localStorage.setItem("planosData", JSON.stringify(appData));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
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
  return new Date().toISOString().slice(0, 10);
}

function getKh2Stats() {
  const records = Object.values(appData.kh2Daily || {});
  const passDays = records.filter(day => day.saved).length;
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
  return ["kh1", "kh2", "kh3", "kh4", "kh5", "kh6"]
    .flatMap(key => appData[key].map(item => ({ ...item, group: key })));
}

function badgeClass(status) {
  if (status === "Xong") return "green";
  if (status === "Quan trọng") return "red";
  return "yellow";
}

function renderDashboard() {
  const stats = getKh2Stats();
  const allItems = getAllItems();

  content.innerHTML = `
    <div class="grid">
      <div class="card hero">
        <h2>Personal Plan Dashboard ✨</h2>
        <p>Trung tâm quản lý KH1 đến KH6. Mỗi kế hoạch đều có thêm, sửa, xóa và đồng bộ Firebase Cloud.</p>
      </div>

      <div class="grid grid-4">
        <div class="card">
          <h3>📚 KH1 Học tập</h3>
          <p class="big">${appData.kh1.length}</p>
          <p class="muted">Mục đang quản lý</p>
        </div>

        <div class="card">
          <h3>💰 KH2 Tiết kiệm</h3>
          <p class="big">${formatMoney(stats.balance)}</p>
          <p class="muted">Số dư lý thuyết</p>
        </div>

        <div class="card">
          <h3>📖 KH4 Sách</h3>
          <p class="big">${appData.kh4.length}</p>
          <p class="muted">Sách / ghi chú</p>
        </div>

        <div class="card">
          <h3>📦 Tổng item</h3>
          <p class="big">${allItems.length}</p>
          <p class="muted">Toàn hệ thống</p>
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Tất cả kế hoạch gần đây</h3>
            <p class="muted">Dữ liệu từ KH1 đến KH6.</p>
          </div>
        </div>

        <div class="list">
          ${
            allItems.length
              ? allItems.slice(-8).reverse().map(renderItem).join("")
              : `<p class="muted">Chưa có dữ liệu. Bấm + Thêm để bắt đầu.</p>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderKhPage(key) {
  const info = pageInfo[key];

  if (key === "kh2") {
    renderKh2();
    return;
  }

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
          <button class="primary-btn" onclick="openAddModal('${key}')">+ Thêm vào ${key.toUpperCase()}</button>
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
          <p class="big ${stats.balance < 0 ? "danger-text" : "success-text"}">${formatMoney(stats.balance)}</p>
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
            <div class="status-line">
              <span>Ngày</span>
              <strong id="kh2SelectedDate">--</strong>
            </div>

            <div class="status-line">
              <span>Đã thêm 15K?</span>
              <strong id="kh2SelectedSaved">Chưa</strong>
            </div>

            <div class="status-line">
              <span>Đã rút</span>
              <strong id="kh2SelectedWithdraw">0đ</strong>
            </div>

            <div class="status-line">
              <span>Ghi chú</span>
              <strong id="kh2SelectedNote">Không có</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <div>
            <h3>Ghi chú / kế hoạch riêng của KH2</h3>
            <p class="muted">Phần này cũng có thêm, sửa, xóa như các KH khác.</p>
          </div>
          <button class="primary-btn" onclick="openAddModal('kh2')">+ Thêm KH2</button>
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
        <div class="list">
          ${renderKh2History()}
        </div>
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
      <span class="badge ${record.saved ? "green" : "red"}">${record.saved ? "PASS" : "Chưa PASS"}</span>
    </div>
  `).join("");
}

function initKh2Form() {
  const dateInput = document.getElementById("kh2DateInput");
  const savedInput = document.getElementById("kh2SavedInput");
  const withdrawInput = document.getElementById("kh2WithdrawInput");
  const noteInput = document.getElementById("kh2NoteInput");
  const saveBtn = document.getElementById("kh2SaveDayBtn");
  const deleteBtn = document.getElementById("kh2DeleteDayBtn");

  function renderSelected() {
    const date = dateInput.value;
    const record = appData.kh2Daily[date] || {
      saved: false,
      withdraw: 0,
      note: ""
    };

    savedInput.checked = Boolean(record.saved);
    withdrawInput.value = record.withdraw || "";
    noteInput.value = record.note || "";

    document.getElementById("kh2SelectedDate").textContent = date || "--";
    document.getElementById("kh2SelectedSaved").textContent = record.saved ? "Đã thêm 15K ✅" : "Chưa thêm ❌";
    document.getElementById("kh2SelectedSaved").className = record.saved ? "success-text" : "danger-text";
    document.getElementById("kh2SelectedWithdraw").textContent = formatMoney(record.withdraw || 0);
    document.getElementById("kh2SelectedNote").textContent = record.note || "Không có";
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

    appData.kh2Daily[date] = {
      saved: savedInput.checked,
      withdraw: Number(withdrawInput.value || 0),
      note: noteInput.value.trim(),
      updatedAt: new Date().toISOString()
    };

    saveLocal();
    renderKh2();
    showToast("Đã lưu ngày này ✅");
  });

  deleteBtn.addEventListener("click", () => {
    const date = dateInput.value;

    if (!appData.kh2Daily[date]) {
      showToast("Ngày này chưa có dữ liệu 😭");
      return;
    }

    delete appData.kh2Daily[date];
    saveLocal();
    renderKh2();
    showToast("Đã xóa ngày này 🗑");
  });
}

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
        <span class="badge ${badgeClass(item.status)}">${escapeHTML(item.status || "Đang làm")}</span>
        <button class="mini-btn" onclick="openEditModal('${group}', '${item.id}')">Sửa</button>
        <button class="mini-btn danger" onclick="deleteItem('${group}', '${item.id}')">Xóa</button>
      </div>
    </div>
  `;
}

function loadPage(pageName) {
  currentPage = pageName;
  pageTitle.textContent = pageInfo[pageName].title;

  navItems.forEach(item => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  if (pageName === "dashboard") {
    renderDashboard();
  } else {
    renderKhPage(pageName);
  }
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
  const item = appData[type].find(x => x.id === id);

  if (!item) return;

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
  appData[type] = appData[type].filter(item => item.id !== id);
  saveLocal();
  loadPage(currentPage);
  showToast("Đã xóa 🗑");
}

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteItem = deleteItem;

planForm.addEventListener("submit", event => {
  event.preventDefault();

  const type = planType.value;
  const id = editId.value;

  const payload = {
    id: id || uid(),
    name: planName.value.trim(),
    date: planDate.value,
    status: planStatus.value,
    note: planNote.value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (id) {
    appData[type] = appData[type].map(item => item.id === id ? { ...item, ...payload } : item);
    showToast("Đã sửa kế hoạch ✅");
  } else {
    appData[type].push({
      ...payload,
      createdAt: new Date().toISOString()
    });
    showToast("Đã thêm kế hoạch ✅");
  }

  saveLocal();
  closeModal();
  loadPage(currentPage);
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
});

addPlanBtn.addEventListener("click", () => openAddModal());
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

planModal.addEventListener("click", event => {
  if (event.target === planModal) {
    closeModal();
  }
});

cloudSaveBtn.addEventListener("click", async () => {
  try {
    await saveDataToCloud({
      ...appData,
      savedAt: new Date().toISOString()
    });

    showToast("Đã lưu cloud ☁️");
  } catch (error) {
    console.error("Lỗi Firebase:", error);
    showToast("Lỗi lưu cloud 😭");
  }
});

cloudLoadBtn.addEventListener("click", async () => {
  try {
    const data = await loadDataFromCloud();

    if (!data) {
      showToast("Cloud chưa có dữ liệu 😭");
      return;
    }

    appData = {
      kh1: data.kh1 || [],
      kh2: data.kh2 || [],
      kh3: data.kh3 || [],
      kh4: data.kh4 || [],
      kh5: data.kh5 || [],
      kh6: data.kh6 || [],
      kh2Daily: data.kh2Daily || data.kh2Data || {}
    };

    saveLocal();
    loadPage(currentPage);
    showToast("Đã tải cloud 🔄");
  } catch (error) {
    console.error("Lỗi tải cloud:", error);
    showToast("Lỗi tải cloud 😭");
  }
});

navItems.forEach(item => {
  item.addEventListener("click", () => loadPage(item.dataset.page));
});

saveLocal();
loadPage("dashboard");