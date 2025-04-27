const transactions = getTransactionsFromLocalStorage();
let editingIndex = null;

const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const list = document.getElementById("transaction-list");
const filter = document.getElementById("category-filter");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const barChartEl = document.getElementById("bar-chart");
const doughnutChartEl = document.getElementById("doughnut-chart");

let barChart, doughnutChart;

const modal = document.getElementById("edit-modal");
const closeModal = document.getElementById("close-modal");
const editForm = document.getElementById("edit-form");
const editName = document.getElementById("edit-name");
const editAmount = document.getElementById("edit-amount");
const editType = document.getElementById("edit-type");

// Handle opening and closing the Add Transaction modal
const openAddModal = document.getElementById("open-add-modal");
const addModal = document.getElementById("add-modal");
const closeAddModal = document.getElementById("close-add-modal");

// Helper function to format amount with commas
function formatAmount(amount) {
  return amount.toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const transaction = {
    name: nameInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: typeInput.value,
  };

  if (!transaction.name || isNaN(transaction.amount)) return;

  transactions.push(transaction);
  updateData();

  // Reset the form
  form.reset();

  // Close the add modal
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

// Optional: Close when clicking outside the modal
window.addEventListener("click", (e) => {
  if (e.target === addModal) {
    addModal.classList.add("hidden");
  }
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingIndex !== null) {
    transactions[editingIndex] = {
      name: editName.value.trim(),
      amount: parseFloat(editAmount.value),
      type: editType.value,
    };
    modal.classList.add("hidden");
    updateData();
  }
});

closeModal.addEventListener("click", () => modal.classList.add("hidden"));

filter.addEventListener("change", updateData);

function updateData() {
  try {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  } catch (error) {
    console.error("Error saving data to localStorage", error);
    // Optionally, you can alert the user or handle the error as needed
  }
  renderList();
  renderSummary();
  renderCharts();
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
  const filtered = transactions.filter(
    (t) => filter.value === "All" || t.type === filter.value
  );
  filtered.forEach((t, index) => {
    list.innerHTML += `
      <li class="${t.type.toLowerCase()}">
        ${t.name} - ₦${formatAmount(t.amount)} (${t.type})
        <div>
          <button class="edit" data-index="${index}">Edit</button>
          <button class="delete" data-index="${index}">Delete</button>
        </div>
      </li>
    `;
  });
}

function renderSummary() {
  const { income, expense } = transactions.reduce(
    (acc, t) => (
      t.type === "Income"
        ? (acc.income += t.amount)
        : (acc.expense += t.amount),
      acc
    ),
    { income: 0, expense: 0 }
  );
  incomeEl.textContent = formatAmount(income);
  expenseEl.textContent = formatAmount(expense);
  balanceEl.textContent = formatAmount(income - expense);
}

function renderCharts() {
  const { income, expense } = transactions.reduce(
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

  barChart?.destroy();
  doughnutChart?.destroy();

  barChart = new Chart(barChartEl, {
    type: "bar",
    data,
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
  doughnutChart = new Chart(doughnutChartEl, {
    type: "doughnut",
    data,
    options: { responsive: true },
  });
}

updateData();

openAddModal.addEventListener("click", () => {
  addModal.classList.remove("hidden");
});

closeAddModal.addEventListener("click", () => {
  addModal.classList.add("hidden");
});
