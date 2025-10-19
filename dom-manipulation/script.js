// -------------------- INITIAL QUOTES DATA --------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// -------------------- DOM ELEMENTS --------------------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// -------------------- SHOW RANDOM QUOTE --------------------
function showRandomQuote() {
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

// -------------------- CREATE ADD QUOTE FORM --------------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
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
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// -------------------- SAVE QUOTES TO LOCAL STORAGE --------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------- POPULATE CATEGORIES DROPDOWN --------------------
function populateCategories() {
  let categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) {
    categoryFilter = document.createElement("select");
    categoryFilter.id = "categoryFilter";
    categoryFilter.addEventListener("change", filterQuotes);
    document.body.insertBefore(categoryFilter, quoteDisplay);
  }

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
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
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
      console.log("✅ Synced with server successfully.");
    }
  } catch (error) {
    console.error("❌ Sync failed:", error);
  }
}

// -------------------- INITIALIZATION --------------------
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  createAddQuoteForm();
  showRandomQuote();
  newQuoteBtn.addEventListener("click", showRandomQuote);
  setInterval(syncWithServer, 10000);
});

// -------------------- FETCH QUOTES FROM SERVER --------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    console.log("Fetched Quotes from Server:", serverQuotes);

    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    populateCategories();
    showRandomQuote();

  } catch (error) {
    console.error("Error fetching quotes from server:", error);
  }
}

// -------------------- SYNC LOCAL QUOTES TO SERVER --------------------
async function postQuotesToServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Quotes successfully posted to server:", result);
    } else {
      console.error("❌ Failed to post quotes to server:", response.status);
    }
  } catch (error) {
    console.error("⚠️ Error posting quotes to server:", error);
  }
}

// -------------------- SYNC QUOTES FUNCTION --------------------
async function syncQuotes() {
  console.log("🔁 Syncing quotes with server...");

  try {
    // Fetch quotes from server (simulation)
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();

    // Merge server data with local data (simulation)
    quotes.push({
      text: serverQuotes[0]?.title || "Server synced quote",
      category: "Server"
    });

    // Save merged data to localStorage
    localStorage.setItem("quotes", JSON.stringify(quotes));

    console.log("✅ Quotes synced successfully with server!");
  } catch (error) {
    console.error("⚠️ Error syncing quotes:", error);
  }

  // Now also post local quotes to server
  try {
    const postResponse = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });

    if (postResponse.ok) {
      console.log("✅ Quotes successfully posted to server!");
    } else {
      console.error("❌ Failed to post quotes to server:", postResponse.status);
    }
  } catch (postError) {
    console.error("⚠️ Error posting quotes to server:", postError);
  }
}
