
// ======================================================================
//  LOAD LOCAL DATA
// ======================================================================

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "Success is not final, failure is not fatal.", category: "Motivation" },
  { id: 2, text: "Simplicity is the ultimate sophistication.", category: "Wisdom" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const importFileInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const notification = document.getElementById("notification");  // require <div id="notification"></div>

// ======================================================================
//  SAVE TO LOCAL STORAGE
// ======================================================================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ======================================================================
//  DISPLAY RANDOM QUOTE
// ======================================================================
function showRandomQuote() {
  let filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available.</p>";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `
      <p>"${randomQuote.text}"</p>
      <small>Category: ${randomQuote.category}</small>
  `;
}

// ======================================================================
//  POPULATE CATEGORY DROPDOWN
// ======================================================================
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

// ======================================================================
//  FILTER QUOTES
// ======================================================================
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ======================================================================
//  ADD NEW QUOTE
// ======================================================================
function createAddQuoteForm() {
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

  showNotification("Quote added locally");
}

// ======================================================================
//  EXPORT JSON
// ======================================================================
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ======================================================================
//  IMPORT JSON
// ======================================================================
function importFromJsonFile(event) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const imported = JSON.parse(e.target.result);

    imported.forEach(q => {
      q.id = Date.now() + Math.random(); // ensure unique IDs
      quotes.push(q);
    });

    saveQuotes();
    populateCategories();
    showNotification("Quotes imported successfully");
  };

  reader.readAsText(event.target.files[0]);
}

// ======================================================================
//  SERVER SYNC LOGIC
// ======================================================================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function syncWithServer() {
  try {
    const result = await fetch(SERVER_URL);
    const serverData = await result.json();

    const serverQuotes = serverData.slice(0, 10).map(item => ({
      id: item.id,
      text: item.title,
      category: "Server"
    }));

    let conflictCount = 0;

    serverQuotes.forEach(serverQuote => {
      const local = quotes.find(q => q.id === serverQuote.id);

      if (!local) {
        // new server quote
        quotes.push(serverQuote);
      } else if (local.text !== serverQuote.text) {
        // conflict → server wins
        conflictCount++;
        Object.assign(local, serverQuote);
      }
    });

    saveQuotes();
    populateCategories();

    if (conflictCount > 0) {
      showNotification(`${conflictCount} conflicts resolved (server won)`);
    } else {
      showNotification("Synced with server");
    }

  } catch (err) {
    showNotification("Server sync failed", true);
  }
}

// Auto sync every 30 seconds
setInterval(syncWithServer, 30000);

// ======================================================================
//  NOTIFICATION POPUP
// ======================================================================
function showNotification(message, error = false) {
  if (!notification) return;

  notification.textContent = message;
  notification.style.backgroundColor = error ? "tomato" : "lightgreen";
  notification.style.display = "block";

  setTimeout(() => (notification.style.display = "none"), 3000);
}

// ======================================================================
//  EVENT LISTENERS
// ======================================================================
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);
addQuoteBtn.addEventListener("click", createAddQuoteForm);
importFileInput.addEventListener("change", importFromJsonFile);
exportBtn.addEventListener("click", exportQuotes);

// ======================================================================
//  INITIAL LOAD
// ======================================================================
window.addEventListener("load", () => {
  populateCategories();
  showRandomQuote();
  syncWithServer(); // initial server pull
});
