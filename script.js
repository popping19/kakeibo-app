// ===== 要素の取得と保存キーの定義 =====
const STORAGE_KEY = "kakeibo-entries";
const form = document.getElementById("entry-form");
const button = document.getElementById("register-button");
const entryList = document.getElementById("entry-list");
// 入力欄（form.elements.item は item() メソッドと衝突するため、idで取得する）
const dateInput = document.getElementById("date");
const itemInput = document.getElementById("item");
const amountInput = document.getElementById("amount");
const memoInput = document.getElementById("memo");

// ===== データの読み込み・保存（localStorage） =====
// 保存データがない・壊れている場合は空の配列から始める
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

let entries = load();

// ===== 表示用の補助関数 =====
const yen = (n) => n.toLocaleString("ja-JP") + "円";
const today = () => new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD形式

// ===== 一覧の表示（日付の新しい順） =====
function renderList() {
  entryList.textContent = "";
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  for (const e of sorted) {
    const tr = document.createElement("tr");
    const cells = [e.date, e.item, e.type === "income" ? "収入" : "支出", yen(e.amount), e.memo];
    for (const text of cells) {
      const td = document.createElement("td");
      td.textContent = text; // textContentで入力文字をHTMLとして解釈させない
      tr.appendChild(td);
    }
    entryList.appendChild(tr);
  }
}

// ===== 合計金額の表示（収入・支出・残高） =====
function renderSummary() {
  const sum = (type) => entries.filter((e) => e.type === type).reduce((s, e) => s + e.amount, 0);
  const income = sum("income");
  const expense = sum("expense");
  document.getElementById("total-income").textContent = yen(income);
  document.getElementById("total-expense").textContent = yen(expense);
  document.getElementById("total-balance").textContent = yen(income - expense);
}

// ===== 登録ボタンの活性切り替え（必須項目が揃うまで押せない） =====
function updateButton() {
  button.disabled = !(dateInput.value && itemInput.value.trim() && /^[0-9]+$/.test(amountInput.value));
}

// ===== 登録処理（追加→保存→再表示→フォームを初期状態へ） =====
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  entries.push({
    id: Date.now(),
    date: dateInput.value,
    item: itemInput.value.trim(),
    type: form.elements.type.value,
    amount: Number(amountInput.value),
    memo: memoInput.value.trim(),
  });
  save();
  form.reset();
  dateInput.value = today();
  updateButton();
  render();
});

form.addEventListener("input", updateButton);

// ===== 画面全体の再描画 =====
function render() {
  renderList();
  renderSummary();
}

// ===== 初期表示（日付は今日、ボタンは非活性から開始） =====
dateInput.value = today();
updateButton();
render();
