// ===============================================================
//  INITIAL SETUP
// ===============================================================

// Load saved quotes from localStorage OR use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Success is not final, failure is not fatal.", category: "Motivation" },
  { text: "Simplicity is the ultimate sophistication.", category: "Wisdom" }
];

// Load the last selected category filter
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// ===============================================================
//  SAVE QUOTES TO LOCAL STORAGE
// ===============================================================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===============================================================
//  SHOW RANDOM QUOTE
// ===============================================================
function showRandomQuote() {
  let filteredQuotes = quotes;

  // Apply filter if not "all"
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available for this category.</p>`;
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>Category: ${randomQuote.category}</small>
  `;
}

// ===============================================================
//  POPULATE CATEGORY DROPDOWN
// ===============================================================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore selected category from storage
  categoryFilter.value = selectedCategory;
}

// ===============================================================
//  FILTER QUOTES
// ===============================================================
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ===============================================================
//  ADD NEW QUOTE
// ===============================================================
function createAddQuoteForm() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text: newText, category: newCategory };
  quotes.push(newQuote);

  saveQuotes();
  populateCategories();  // Update dropdown if new category added

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// ===============================================================
//  EXPORT QUOTES TO JSON FILE
// ===============================================================
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

// ===============================================================
//  IMPORT QUOTES FROM JSON FILE
// ===============================================================
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };

  fileReader.readAsText(event.target.files[0]);
}

// ===============================================================
//  INITIALIZE APP
// ===============================================================
window.onload = function () {
  populateCategories();   // Load categories
  showRandomQuote();      // Show initial quote
};
