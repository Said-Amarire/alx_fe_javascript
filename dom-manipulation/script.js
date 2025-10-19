let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><em>- ${quote.category}</em>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categories = ["All Categories", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) categoryFilter.value = lastFilter;
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastFilter", selected);
  showRandomQuote();
}

function getFilteredQuotes() {
  const selected = categoryFilter.value;
  if (selected === "All Categories") return quotes;
  return quotes.filter(q => q.category === selected);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

populateCategories();
showRandomQuote();
