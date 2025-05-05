const transactions = getTransactionsFromLocalStorage();
let editingIndex = null;

const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const list = document.getElementById("transaction-list");
const filter = document.getElementById("category-filter");
const dateFilter = document.getElementById("date-filter");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const barChartEl = document.getElementById("bar-chart");
const doughnutChartEl = document.getElementById("doughnut-chart");

let barChart, doughnutChart;

// To open and close the Edit Transaction modal
const modal = document.getElementById("edit-modal");
const closeModal = document.getElementById("close-modal");
const editForm = document.getElementById("edit-form");
const editName = document.getElementById("edit-name");
const editAmount = document.getElementById("edit-amount");
const editType = document.getElementById("edit-type");

// To open and close the Add Transaction modal
const openAddModal = document.getElementById("open-add-modal");
const addModal = document.getElementById("add-modal");
const closeAddModal = document.getElementById("close-add-modal");

function formatAmount(amount) {
  return amount.toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options); // Output: "03 May, 2025"
}

function formatTime(timeStr) {
  const [hour, minute, second] = timeStr.split(":");
  const date = new Date();
  date.setHours(hour, minute, second || 0);
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .toLowerCase(); // Outputs like "1:20:45 pm"
}

function getTransactionsFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  } catch (error) {
    console.error("Error reading data from localStorage", error);
    return [];
  }
}

function renderList() {
  list.innerHTML = "";
  const selectedDate = dateFilter.value;
  const filtered = transactions.filter(
    (t) =>
      (filter.value === "All" || t.type === filter.value) &&
      (selectedDate === "" || t.date === selectedDate)
  );

  if (filtered.length === 0) {
    list.innerHTML = `<li>No transactions found.</li>`;
    return;
  }

  filtered.forEach((t, index) => {
    list.innerHTML += `
      <li class="${t.type.toLowerCase()}">
        <div>
          <p><strong>${t.name}</strong></p> 
          <p>₦${formatAmount(t.amount)}</p>
        <p>${formatDate(t.date)} | ${formatTime(t.time)}</p>

        </div>
        <div>
          <button class="edit" data-index="${index}">Edit</button>
          <button class="delete" data-index="${index}">Delete</button>
        </div>
      </li>
    `;
  });
}

function renderSummary() {
  const selectedCategory = filter.value;
  const selectedDate = dateFilter.value;

  // Filter the transactions based on selected filters (category and date)
  const filteredTransactions = transactions.filter(
    (t) =>
      (selectedCategory === "All" || t.type === selectedCategory) &&
      (selectedDate === "" || t.date === selectedDate)
  );

  // Calculate total income, expense, and balance for filtered transactions
  const { income, expense } = filteredTransactions.reduce(
    (acc, t) => (
      t.type === "Income"
        ? (acc.income += t.amount)
        : (acc.expense += t.amount),
      acc
    ),
    { income: 0, expense: 0 }
  );

  // Update the displayed totals
  incomeEl.textContent = formatAmount(income);
  expenseEl.textContent = formatAmount(expense);
  balanceEl.textContent = formatAmount(income - expense);

  // Also update the chart with the new income and expense
  renderCharts(filteredTransactions);
}

function renderCharts(filteredTransactions) {
  // Calculate total income and expense for the filtered transactions
  const { income, expense } = filteredTransactions.reduce(
    (acc, t) => (
      t.type === "Income"
        ? (acc.income += t.amount)
        : (acc.expense += t.amount),
      acc
    ),
    { income: 0, expense: 0 }
  );

  const data = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Transactions",
        data: [income, expense],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  };

  // Destroy the old chart if it exists before creating a new one
  doughnutChart?.destroy();

  doughnutChart = new Chart(doughnutChartEl, {
    type: "doughnut",
    data,
    options: { responsive: true },
  });
}

function updateData() {
  try {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  } catch (error) {
    console.error("Error saving data to localStorage", error);
  }
  renderList();
  renderSummary();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toLocaleTimeString();

  const transaction = {
    name: nameInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: typeInput.value,
    date,
    time,
  };

  if (!transaction.name || isNaN(transaction.amount)) return;

  transactions.push(transaction);
  updateData();

  form.reset();
  addModal.classList.add("hidden");
});

list.addEventListener("click", (e) => {
  const index = e.target.dataset.index;
  if (e.target.classList.contains("delete")) {
    transactions.splice(index, 1);
  } else if (e.target.classList.contains("edit")) {
    editingIndex = index;
    const tx = transactions[editingIndex];
    editName.value = tx.name;
    editAmount.value = tx.amount;
    editType.value = tx.type;
    modal.classList.remove("hidden");
  }
  updateData();
});

window.addEventListener("click", (e) => {
  if (e.target === addModal) {
    addModal.classList.add("hidden");
  }
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingIndex !== null) {
    const original = transactions[editingIndex];
    transactions[editingIndex] = {
      name: editName.value.trim(),
      amount: parseFloat(editAmount.value),
      type: editType.value,
      date: original.date,
      time: original.time,
    };
    modal.classList.add("hidden");
    updateData();
  }
});

closeModal.addEventListener("click", () => modal.classList.add("hidden"));

filter.addEventListener("change", () => {
  if (filter.value === "All") {
    dateFilter.value = ""; // Clear date input if "All" selected
  }
  renderSummary(); // Update the summary after category filter change
  updateData(); // Update the list and charts
});

dateFilter.addEventListener("change", () => {
  renderSummary(); // Update the summary after date filter change
  updateData(); // Update the list and charts
});

openAddModal.addEventListener("click", () => {
  addModal.classList.remove("hidden");
});

closeAddModal.addEventListener("click", () => {
  addModal.classList.add("hidden");
});

updateData();
