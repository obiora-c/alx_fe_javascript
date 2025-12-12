
// ================================
// DYNAMIC QUOTE GENERATOR SCRIPT
// ================================

// Load quotes from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "Success is not final, failure is not fatal.", category: "Motivation" },
  { id: 2, text: "Simplicity is the ultimate sophistication.", category: "Wisdom" }
];

// Selected category filter
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const importFileInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const syncBtn = document.getElementById("syncBtn");
const notification = document.getElementById("notification");

// ================================
// LOCAL STORAGE
// ================================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ================================
// SHOW RANDOM QUOTE
// ================================
function showRandomQuote() {
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available.</p>";
    return;
  }
  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><small>Category: ${randomQuote.category}</small>`;
}

// ================================
// POPULATE CATEGORY DROPDOWN
// ================================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  categoryFilter.value = selectedCategory;
}

// ================================
// FILTER QUOTES
// ================================
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ================================
// ADD NEW QUOTE
// ================================
function createAddQuoteForm() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Both fields are required.");
    return;
  }

  const newQuote = { id: Date.now(), text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  textInput.value = "";
  categoryInput.value = "";
  showNotification("Quote added locally");

  // Immediately send to server
  postQuotesToServer(newQuote);
}

// ================================
// EXPORT QUOTES AS JSON
// ================================
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ================================
// IMPORT QUOTES FROM JSON FILE
// ================================
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const imported = JSON.parse(e.target.result);
    imported.forEach(q => q.id = Date.now() + Math.random()); // unique IDs
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    showNotification("Quotes imported successfully");
  };
  reader.readAsText(event.target.files[0]);
}

// ================================
// NOTIFICATIONS
// ================================
function showNotification(message, isError = false) {
  if (!notification) return;
  notification.textContent = message;
  notification.style.backgroundColor = isError ? "tomato" : "lightgreen";
  notification.style.display = "block";
  setTimeout(() => notification.style.display = "none", 3000);
}

// ================================
// SERVER INTERACTIONS
// ================================

// Fetch quotes from server
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();
  return data.slice(0, 10).map(post => ({
    id: post.id,
    text: post.title,
    category: "Server"
  }));
}

// Sync local quotes with server (POST with headers)
async function postQuotesToServer(quote = null) {
  const quotesToSend = quote ? [quote] : JSON.parse(localStorage.getItem("quotes")) || [];

  if (quotesToSend.length === 0) {
    console.log("No quotes to sync.");
    return;
  }

  try {
    const response = await fetch("https://example.com/sync-quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quotes: quotesToSend })
    });
    const data = await response.json();
    console.log("Quotes successfully posted to server:", data);
    showNotification("Quotes synced with server");
  } catch (error) {
    console.error("Error posting quotes to server:", error);
    showNotification("Server sync failed", true);
  }
}

// Full sync from server (GET + merge conflicts)
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let conflictCount = 0;

    serverQuotes.forEach(serverQuote => {
      const local = quotes.find(q => q.id === serverQuote.id);
      if (!local) {
        quotes.push(serverQuote);
      } else if (local.text !== serverQuote.text) {
        Object.assign(local, serverQuote); // server wins
        conflictCount++;
      }
    });

    saveQuotes();
    populateCategories();
    showRandomQuote();

    if (conflictCount > 0) {
      showNotification(`${conflictCount} conflicts resolved (server data used)`);
    } else {
      showNotification("Quotes synced with server");
    }
  } catch (error) {
    showNotification("Server sync failed", true);
    console.error("Sync error:", error);
  }
}

// Auto-sync every 30 seconds
setInterval(syncQuotes, 30000);

// ================================
// EVENT LISTENERS
// ================================
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);
addQuoteBtn.addEventListener("click", createAddQuoteForm);
importFileInput.addEventListener("change", importFromJsonFile);
exportBtn.addEventListener("click", exportQuotes);
syncBtn.addEventListener("click", syncQuotes);

// ================================
// INITIALIZE APP
// ================================
window.addEventListener("load", () => {
  populateCategories();
  showRandomQuote();
  syncQuotes(); // initial server sync
});
