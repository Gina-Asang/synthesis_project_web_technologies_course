
/*
  FinWise - Budget and Transactions
  This file handles transaction forms, monthly budgets,
  the financial summary, and transaction history.
*/

document.addEventListener("DOMContentLoaded", function () {
    // Set today's date as the default transaction date.
    document.getElementById("transactionDate").value =
        new Date().toISOString().split("T")[0];

    // Connect the forms to their functions.
    document.getElementById("transactionForm")
        .addEventListener("submit", handleTransactionSubmit);

    document.getElementById("budgetForm")
        .addEventListener("submit", handleBudgetSubmit);

    // Display the saved information when the page opens.
    displayBudgetSummary();
    displayBudgetList();
    displayTransactionHistory();
});

// Handle submission of the transaction form.
function handleTransactionSubmit(event) {
    event.preventDefault();

    // Get the values entered into the form.
    const type = document.getElementById("transactionType").value;
    const description = document.getElementById("transactionDescription").value;
    const category = document.getElementById("transactionCategory").value;
    const amount = document.getElementById("transactionAmount").value;
    const date = document.getElementById("transactionDate").value;

    // Save the transaction using the shared data function.
    const saved = addTransaction(type, description, category, amount, date);

    if (saved) {
        document.getElementById("transactionMessage").textContent =
            "Transaction saved successfully!";

        // Clear the form after saving, but keep today's date.
        document.getElementById("transactionForm").reset();

        document.getElementById("transactionDate").value =
            new Date().toISOString().split("T")[0];

        // Refresh the information displayed on the page.
        displayBudgetSummary();
        displayTransactionHistory();
    }
}

// Handle submission of the monthly budget form.
function handleBudgetSubmit(event) {
    event.preventDefault();

    const category = document.getElementById("budgetCategory").value;
    const amount = document.getElementById("budgetAmount").value;

    // Save the budget using the shared data function.
    const saved = setBudget(category, amount);

    if (saved) {
        document.getElementById("budgetMessage").textContent =
            "Monthly budget saved successfully!";

        document.getElementById("budgetForm").reset();

        // Refresh the budget information.
        displayBudgetSummary();
        displayBudgetList();
    }
}

// Update the income, expenses, and balance displayed at the top.
function displayBudgetSummary() {
    document.getElementById("budgetIncome").textContent =
        formatCurrency(getMonthlyIncome());

    document.getElementById("budgetExpenses").textContent =
        formatCurrency(getMonthlyExpenses());

    document.getElementById("budgetBalance").textContent =
        formatCurrency(getMonthlyBalance());
}

// Display the saved monthly budgets.
function displayBudgetList() {
    const data = getFinWiseData();
    const budgetList = document.getElementById("budgetList");

    // Remove the previous list before displaying updated information.
    budgetList.innerHTML = "";

    const categories = Object.keys(data.budgets);

    if (categories.length === 0) {
        budgetList.textContent = "You have not set any budgets yet.";
        return;
    }

    const heading = document.createElement("h3");
    heading.textContent = "Your Monthly Budgets";
    budgetList.appendChild(heading);

    categories.forEach(function (category) {
        const item = document.createElement("p");

        item.textContent =
            category + ": " + formatCurrency(data.budgets[category]);

        budgetList.appendChild(item);
    });
}

// Display all recorded transactions in the history table.
function displayTransactionHistory() {
    const data = getFinWiseData();
    const tableBody = document.getElementById("transactionTableBody");

    tableBody.innerHTML = "";

    // Show a message if there are no transactions.
    if (data.transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">No transactions recorded yet.</td>
            </tr>
        `;
        return;
    }

    // Display the newest transactions first.
    const sortedTransactions = [...data.transactions].sort(
        function (first, second) {
            return new Date(second.date) - new Date(first.date);
        }
    );

    sortedTransactions.forEach(function (transaction) {
        const row = document.createElement("tr");

        // Add the date.
        const dateCell = document.createElement("td");
        dateCell.textContent = transaction.date;
        row.appendChild(dateCell);

        // Add the description.
        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = transaction.description;
        row.appendChild(descriptionCell);

        // Add the category.
        const categoryCell = document.createElement("td");
        categoryCell.textContent = transaction.category;
        row.appendChild(categoryCell);

        // Add the transaction type.
        const typeCell = document.createElement("td");
        typeCell.textContent =
            transaction.type.charAt(0).toUpperCase() +
            transaction.type.slice(1);
        row.appendChild(typeCell);

        // Add the amount.
        const amountCell = document.createElement("td");

        const sign = transaction.type === "income" ? "+" : "-";

        amountCell.textContent =
            sign + formatCurrency(transaction.amount);

        row.appendChild(amountCell);

        // Add a delete button.
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.className = "btn btn-small";

        // Delete this transaction when the button is clicked.
        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Are you sure you want to delete this transaction?"
            );

            if (confirmed) {
                deleteTransaction(transaction.id);

                displayBudgetSummary();
                displayTransactionHistory();
            }
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}
