const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
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
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderList();
  renderSummary();
  renderCharts();
}

function renderList() {
  list.innerHTML = "";
  const filtered = transactions.filter(
    (t) => filter.value === "All" || t.type === filter.value
  );
  filtered.forEach((t, index) => {
    list.innerHTML += `
      <li class="${t.type.toLowerCase()}">
        ${t.name} - ₦${t.amount.toFixed(2)} (${t.type})
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
  incomeEl.textContent = income.toFixed(2);
  expenseEl.textContent = expense.toFixed(2);
  balanceEl.textContent = (income - expense).toFixed(2);
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
