

// ===========================
// STORAGE KEYS
// ===========================
const LS_KEY_QUOTES = "dynamic_quotes_v1";
const SESSION_KEY_LAST = "dynamic_quotes_last_viewed_v1";
const CATEGORY_FILTER_KEY = "dynamic_quotes_selected_category_v1";

// ===========================
// DEFAULT QUOTES
// ===========================
const defaultQuotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
];

// ===========================
// DOM ELEMENTS
// ===========================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const clearStorageBtn = document.getElementById("clearStorageBtn");
const showLastBtn = document.getElementById("showLast");
const lastViewedText = document.getElementById("lastViewedText");
const categoryFilter = document.getElementById("categoryFilter");

// ===========================
// APP STATE
// ===========================
let quotes = [];


// ===========================
// LOCAL STORAGE OPERATIONS
// ===========================
function saveQuotesToLocalStorage() {
  localStorage.setItem(LS_KEY_QUOTES, JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const stored = localStorage.getItem(LS_KEY_QUOTES);

  if (stored) {
    try {
      quotes = JSON.parse(stored);
      if (!Array.isArray(quotes)) throw new Error();
    } catch {
      quotes = [...defaultQuotes];
      saveQuotesToLocalStorage();
    }
  } else {
    quotes = [...defaultQuotes];
    saveQuotesToLocalStorage();
  }
}


// ===========================
// SESSION STORAGE (Last Viewed)
// ===========================
function saveLastViewed(quoteObj) {
  sessionStorage.setItem(SESSION_KEY_LAST, JSON.stringify(quoteObj));
  renderLastViewed();
}

function getLastViewed() {
  const saved = sessionStorage.getItem(SESSION_KEY_LAST);
  return saved ? JSON.parse(saved) : null;
}

function renderLastViewed() {
  const last = getLastViewed();
  lastViewedText.textContent = last ? `"${last.text}" (${last.category})` : "—";
}


// ===========================
// CATEGORY FILTERING
// ===========================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))].sort();

  categoryFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const savedFilter = localStorage.getItem(CATEGORY_FILTER_KEY);
  if (savedFilter && [...categoryFilter.options].some(o => o.value === savedFilter)) {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = "all";
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;

  localStorage.setItem(CATEGORY_FILTER_KEY, selected);

  if (selected === "all") {
    showRandomQuote();
    return;
  }

  const filtered = quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<em>No quotes found in category: ${selected}</em>`;
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  renderQuote(random);
}


// ===========================
// QUOTE DISPLAY FUNCTIONS
// ===========================
function clearQuoteDisplay() {
  quoteDisplay.innerHTML = "";
}

function renderQuote(quoteObj) {
  clearQuoteDisplay();

  const p = document.createElement("p");
  p.textContent = `"${quoteObj.text}"`;

  const small = document.createElement("div");
  small.className = "small";
  small.textContent = `Category: ${quoteObj.category}`;

  quoteDisplay.appendChild(p);
  quoteDisplay.appendChild(small);

  saveLastViewed(quoteObj);
}

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available.</em>";
    return;
  }

  const random = quotes[Math.floor(Math.random() * quotes.length)];
  renderQuote(random);
}


// ===========================
// ADD QUOTE
// ===========================
function addQuoteFromInputs() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Both text and category are required.");
    return;
  }

  const newQuote = { text, category };

  quotes.push(newQuote);
  saveQuotesToLocalStorage();
  populateCategories();
  renderQuote(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}


// ===========================
// JSON IMPORT / EXPORT
// ===========================
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error();

      imported.forEach(item => {
        if (item.text && item.category) {
          quotes.push({ text: item.text, category: item.category });
        }
      });

      saveQuotesToLocalStorage();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };

  reader.readAsText(file);
}


// ===========================
// CLEAR STORAGE
// ===========================
function clearLocalStorageAndReset() {
  if (!confirm("This will erase all saved quotes. Continue?")) return;

  localStorage.removeItem(LS_KEY_QUOTES);
  loadQuotesFromLocalStorage();
  populateCategories();
  showRandomQuote();
}


// ===========================
// EVENT LISTENERS
// ===========================
function setupEventListeners() {
  newQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", addQuoteFromInputs);
  exportBtn.addEventListener("click", exportQuotesToJson);
  showLastBtn.addEventListener("click", () => {
    const last = getLastViewed();
    if (last) renderQuote(last);
  });

  importFileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) importFromJsonFile(f);
  });

  clearStorageBtn.addEventListener("click", clearLocalStorageAndReset);

  categoryFilter.addEventListener("change", filterQuotes);
}


// ===========================
// INIT
// ===========================
function init() {
  loadQuotesFromLocalStorage();
  setupEventListeners();
  populateCategories();
  renderLastViewed();
  filterQuotes(); // Apply saved filter OR show random
}

init();
