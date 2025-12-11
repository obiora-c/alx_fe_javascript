

// --------------------------------------
// STEP 1: MAIN QUOTES ARRAY
// --------------------------------------
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" }
];

// Select DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");


// --------------------------------------
// STEP 2: SHOW RANDOM QUOTE FUNCTION
// --------------------------------------
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available.</em>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];

  // Create dynamic elements
  quoteDisplay.innerHTML = ""; // clear previous content

  const quoteTextElem = document.createElement("p");
  quoteTextElem.textContent = `"${selectedQuote.text}"`;

  const quoteCategoryElem = document.createElement("small");
  quoteCategoryElem.textContent = `Category: ${selectedQuote.category}`;

  // Append elements
  quoteDisplay.appendChild(quoteTextElem);
  quoteDisplay.appendChild(quoteCategoryElem);
}


// --------------------------------------
// STEP 3: ADD NEW QUOTE DYNAMICALLY
// --------------------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both fields!");
    return;
  }

  // Add new quote object to array
  quotes.push({
    text: newText,
    category: newCategory
  });

  // Clear fields
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}


// --------------------------------------
// EVENT LISTENERS
// --------------------------------------
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Display one quote when page loads
showRandomQuote();
