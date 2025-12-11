


// Keys for web storage
const LS_KEY = "dynamic_quotes_v1";
const SESSION_KEY_LAST = "dynamic_quotes_last_viewed_v1";

// Default quotes (used if no localStorage present)
const defaultQuotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" }
];

// Cached DOM nodes
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const clearStorageBtn = document.getElementById("clearStorageBtn");
const lastViewedText = document.getElementById("lastViewedText");
const showLastBtn = document.getElementById("showLast");

// Application state
let quotes = [];

// ---------- Storage helpers ----------
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
    alert("Error saving quotes to Local Storage (maybe quota exceeded).");
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      quotes = [...defaultQuotes];
      saveQuotesToLocalStorage();
      return;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Stored data is not an array.");
    // Optionally validate elements minimally
    quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
  } catch (err) {
    console.warn("Could not load local quotes, falling back to defaults:", err);
    quotes = [...defaultQuotes];
    saveQuotesToLocalStorage();
  }
}

function saveLastViewedToSession(quoteObj) {
  try {
    sessionStorage.setItem(SESSION_KEY_LAST, JSON.stringify(quoteObj));
    renderLastViewed();
  } catch (err) {
    console.warn("Failed to save session info:", err);
  }
}

function getLastViewedFromSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_LAST);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderLastViewed() {
  const last = getLastViewedFromSession();
  lastViewedText.textContent = last ? `"${truncate(last.text, 60)}" (${last.category})` : "—";
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n-1) + "…" : str;
}

// ---------- UI / Quote functions ----------
function clearQuoteDisplay() {
  quoteDisplay.innerHTML = "";
}

function renderQuote(quoteObj) {
  clearQuoteDisplay();
  const p = document.createElement("p");
  p.textContent = `"${quoteObj.text}"`;
  p.style.margin = "0 0 8px 0";

  const small = document.createElement("div");
  small.className = "small";
  small.textContent = `Category: ${quoteObj.category}`;

  quoteDisplay.appendChild(p);
  quoteDisplay.appendChild(small);

  // store last viewed in session storage
  saveLastViewedToSession(quoteObj);
}

function showRandomQuote() {
  if (!quotes.length) {
    quoteDisplay.innerHTML = "<em>No quotes available.</em>";
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  renderQuote(quotes[idx]);
}

// Add new quote from inputs (basic validation)
function createAddQuoteForm() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = (textInput.value || "").trim();
  const category = (categoryInput.value || "").trim();

  if (!text || !category) {
    alert("Please provide both quote text and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotesToLocalStorage();

  // clear inputs and show the added quote
  textInput.value = "";
  categoryInput.value = "";
  renderQuote(newQuote);

  alert("Quote added and saved to Local Storage.");
}

// ---------- Import / Export JSON ----------
function exportQuotesToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // create a temporary link and click it
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `quotes-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export quotes.");
  }
}

function importFromJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) throw new Error("Imported JSON must be an array of quote objects.");

      // Validate and normalize
      const valid = parsed.filter(item =>
        item
        && typeof item.text === "string"
        && typeof item.category === "string"
      ).map(item => ({ text: item.text.trim(), category: item.category.trim() }));

      if (!valid.length) {
        alert("No valid quote objects found in the file. They must be objects with 'text' and 'category' strings.");
        return;
      }

      // Add quotes (simple append). Could dedupe if desired.
      quotes.push(...valid);
      saveQuotesToLocalStorage();
      alert(`Imported ${valid.length} quotes successfully!`);
      // show the first imported one
      renderQuote(valid[0]);
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import JSON: " + (err.message || err));
    }
  };
  reader.onerror = function () {
    alert("Error reading file.");
  };
  reader.readAsText(file);
}

// ---------- Utility / Controls ----------
function clearLocalStorageAndReset() {
  if (!confirm("This will delete all saved quotes in Local Storage and reset to defaults. Continue?")) return;
  localStorage.removeItem(LS_KEY);
  loadQuotesFromLocalStorage();
  showRandomQuote();
  alert("Local Storage cleared. Quotes reset to defaults.");
}

// ---------- Event wiring ----------
function setupEventListeners() {
  newQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", createAddQuoteForm);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFileInput.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importFromJsonFile(f);
    // reset input so same file can be chosen again if needed
    importFileInput.value = "";
  });
  clearStorageBtn.addEventListener("click", clearLocalStorageAndReset);
  showLastBtn.addEventListener("click", () => {
    const last = getLastViewedFromSession();
    if (last) renderQuote(last);
    else alert("No last-viewed quote in this session.");
  });
}

// ---------- Init ----------
function init() {
  loadQuotesFromLocalStorage();
  setupEventListeners();
  renderLastViewed();

  // Display a random quote on load
  showRandomQuote();
}

init();


function populateCategories() {
  // Gather unique categories
  const categories = [...new Set(quotes.map(q => q.category))].sort();

  // Clear existing options
  categoryFilter.innerHTML = "";

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  // Add categories dynamically
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem(CATEGORY_FILTER_KEY);
  if (savedFilter && [...categoryFilter.options].some(o => o.value === savedFilter)) {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = "all";
  }
}


function filterQuotes() {
  const selected = categoryFilter.value;

  // Save filter selection to Local Storage
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

  // Display one random filtered quote
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  renderQuote(random);
}


populateCategories();  // refresh dropdown when a new category is added


quotes.push(newQuote);
saveQuotesToLocalStorage();
populateCategories();   // <-- NEW

textInput.value = "";
categoryInput.value = "";
renderQuote(newQuote);

alert("Quote added and saved to Local Storage.");

quotes.push(...valid);
saveQuotesToLocalStorage();
populateCategories();   // <-- NEW
filterQuotes(); 