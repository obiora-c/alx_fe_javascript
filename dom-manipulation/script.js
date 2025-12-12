

// ===================================================================
//  INITIAL SETUP: Load Local Storage + Defaults
// ===================================================================

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Success is not final.", category: "Motivation", id: 1 },
  { text: "Wisdom begins in wonder.", category: "Wisdom", id: 2 }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const importFileInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const notificationBox = document.getElementById("notification"); // Needs div in HTML

// ===================================================================
//  SAVE QUOTES TO LOCAL STORAGE
// ===================================================================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===================================================================
//  SHOW RANDOM QUOTE
// ===================================================================
function showRandomQuote() {
  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>Category: ${randomQuote.category}</small>
  `;
}

// ===================================================================
//  POPULATE CATEGORIES
// ===================================================================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = selectedCategory;
}

// ===================================================================
//  FILTER QUOTES
// ===================================================================
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ===================================================================
//  ADD QUOTE
// ===================================================================
function CreateAddQuoteForm() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Both fields are required.");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";

  showNotification("Quote added locally (not synced)");
}

// ===================================================================
//  EXPORT JSON
// ===================================================================
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ===================================================================
//  IMPORT JSON
// ===================================================================
function importFromJsonFile(e) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const imported = JSON.parse(event.target.result);

    imported.forEach(q => {
      q.id = Date.now() + Math.random(); // ensure unique ID
      quotes.push(q);
    });

    saveQuotes();
    populateCategories();
    showNotification("Quotes imported successfully");
  };

  reader.readAsText(e.target.files[0]);
}

// ===================================================================
//  SERVER SYNC SIMULATION
// ===================================================================

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from fake server
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Convert server posts into quote-like objects
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      category: "Server"
    }));

    let conflicts = [];

    serverQuotes.forEach(serverQuote => {
      const localQuote = quotes.find(q => q.id === serverQuote.id);

      if (!localQuote) {
        // NEW SERVER QUOTE → ADD TO LOCAL
        quotes.push(serverQuote);
      } else if (localQuote.text !== serverQuote.text) {
        // CONFLICT → SERVER WINS
        conflicts.push({ local: localQuote, server: serverQuote });
        Object.assign(localQuote, serverQuote);
      }
    });

    saveQuotes();
    populateCategories();

    if (conflicts.length > 0) {
      showNotification("Conflicts resolved: server version used");
    } else {
      showNotification("Synced with server");
    }

  } catch (err) {
    console.error("Sync error:", err);
    showNotification("Server sync failed", true);
  }
}

// Auto-sync every 30 seconds
setInterval(syncWithServer, 30000);

// ===================================================================
//  NOTIFICATION SYSTEM
// ===================================================================
function showNotification(message, isError = false) {
  if (!notificationBox) return;
  notificationBox.textContent = message;
  notificationBox.style.background = isError ? "tomato" : "lightgreen";
  notificationBox.style.display = "block";

  setTimeout(() => {
    notificationBox.style.display = "none";
  }, 3000);
}

// ===================================================================
//  EVENT LISTENERS (REQUIRED BY YOU)
// ===================================================================
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);
addQuoteBtn.addEventListener("click", CreateAddQuoteForm);
importFileInput.addEventListener("change", importFromJsonFile);
exportBtn.addEventListener("click", exportQuotes);

// ===================================================================
//  INITIAL APP LOAD
// ===================================================================
window.addEventListener("load", () => {
  populateCategories();
  showRandomQuote();
  syncWithServer(); // initial sync
});
