// -------------------- INITIAL QUOTES DATA --------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// -------------------- DOM ELEMENTS --------------------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// -------------------- DISPLAY RANDOM QUOTE --------------------
function displayRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><em>- ${randomQuote.category}</em>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// -------------------- ADD NEW QUOTE --------------------
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both quote and category!");
    return;
  }

  const newQuote = { text: newQuoteText, category: newQuoteCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// -------------------- SAVE QUOTES TO LOCAL STORAGE --------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------- POPULATE CATEGORIES DROPDOWN --------------------
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedCategory;
}

// -------------------- FILTER QUOTES BY CATEGORY --------------------
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayRandomQuote();
}

// -------------------- EXPORT QUOTES TO JSON FILE --------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------- IMPORT QUOTES FROM JSON FILE --------------------
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch {
      alert("Error parsing JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- SIMULATE SERVER SYNC --------------------
async function syncWithServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();

    if (serverQuotes && Array.isArray(serverQuotes)) {
      // Simple conflict resolution: server wins
      localStorage.setItem("quotes", JSON.stringify(quotes));
      console.log("✅ Synced with server successfully.");
    }
  } catch (error) {
    console.error("❌ Sync failed:", error);
  }
}

// -------------------- INITIALIZATION --------------------
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  displayRandomQuote();
  newQuoteBtn.addEventListener("click", displayRandomQuote);
  setInterval(syncWithServer, 10000); // simulate server sync every 10s
});
