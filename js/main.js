
/*
  FinWise - Dashboard JavaScript
  This file loads the financial information and displays it
  on the dashboard in index.html.
*/

// Run the dashboard code after the HTML page has loaded.
document.addEventListener("DOMContentLoaded", function () {
    displayDashboard();
});

// Display all the dashboard information.
function displayDashboard() {

    // Get the financial information saved in the browser.
    const data = getFinWiseData();

    // Calculate this month's financial figures.
    const income = getMonthlyIncome();
    const expenses = getMonthlyExpenses();
    const savings = getMonthlySavingsContributions();
    const balance = getMonthlyBalance();

    // Get all the savings goals.
    const goals = data.goals;

    // Calculate the total amount saved across all goals.
    const totalSaved = goals.reduce(function (total, goal) {
        return total + Number(goal.savedAmount);
    }, 0);

    // Calculate the combined target for all savings goals.
    const totalTarget = goals.reduce(function (total, goal) {
        return total + Number(goal.targetAmount);
    }, 0);

    // Calculate the total monthly budget.
    const totalBudget = Object.values(data.budgets).reduce(
        function (total, amount) {
            return total + Number(amount);
        },
        0
    );

    // Display the financial summary.
    document.getElementById("dashboardIncome").textContent =
        formatCurrency(income);

    document.getElementById("dashboardExpenses").textContent =
        formatCurrency(expenses);

    document.getElementById("dashboardBalance").textContent =
        formatCurrency(balance);

    // Display the total savings and savings target.
    document.getElementById("dashboardSaved").textContent =
        formatCurrency(totalSaved);

    document.getElementById("dashboardTarget").textContent =
        formatCurrency(totalTarget);

    // Update the budget progress bar.
    const spendingTrack = document.getElementById("dashboardSpendingTrack");
    const spendingBar = document.getElementById("dashboardSpendingBar");
    const spendingText = document.getElementById("dashboardSpendingText");
    const budgetMessage = document.getElementById("dashboardBudgetMessage");

    // Avoid dividing by zero when no budget has been set.
    const budgetPercentage = totalBudget > 0
        ? (expenses / totalBudget) * 100
        : 0;

    spendingBar.style.width = Math.min(budgetPercentage, 100) + "%";

    spendingText.textContent = totalBudget > 0
        ? Math.round(budgetPercentage) + "% of budget used"
        : "No budget set yet";

    budgetMessage.textContent = totalBudget > 0
        ? "You have spent " + formatCurrency(expenses) +
          " out of your " + formatCurrency(totalBudget) + " budget."
        : "Set your monthly budget on the Budget page to track your spending.";

    // Update the savings goals progress bar.
    const goalsBar = document.getElementById("dashboardGoalsBar");
    const goalsText = document.getElementById("dashboardGoalsText");

    const goalsPercentage = totalTarget > 0
        ? (totalSaved / totalTarget) * 100
        : 0;

    goalsBar.style.width = Math.min(goalsPercentage, 100) + "%";

    goalsText.textContent = totalTarget > 0
        ? Math.round(goalsPercentage) + "% of savings target reached"
        : "Create a savings goal to get started";

    // Show recent transactions in the table.
    displayRecentTransactions(data.transactions);
}

// Display the five most recent transactions.
function displayRecentTransactions(transactions) {

    const tableBody = document.getElementById("dashboardTransactions");

    // Sort transactions by date, with the newest first.
    const recentTransactions = [...transactions]
        .sort(function (first, second) {
            return new Date(second.date) - new Date(first.date);
        })
        .slice(0, 5);

    // Clear any existing table rows.
    tableBody.innerHTML = "";

    // Show a message when no transactions have been recorded.
    if (recentTransactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">No transactions yet. Start by recording your income or expenses.</td>
            </tr>
        `;
        return;
    }

    // Create a table row for each recent transaction.
    recentTransactions.forEach(function (transaction) {

        const row = document.createElement("tr");

        // Create a table cell for the date.
        const dateCell = document.createElement("td");
        dateCell.textContent = transaction.date;

        // Create a table cell for the transaction description.
        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = transaction.description;

        // Create a table cell for the transaction category.
        const categoryCell = document.createElement("td");
        categoryCell.textContent = transaction.category;

        // Create a table cell for the amount.
        const amountCell = document.createElement("td");

        // Add a plus sign to income and a minus sign to outflows.
        const sign = transaction.type === "income" ? "+" : "-";

        amountCell.textContent =
            sign + formatCurrency(transaction.amount);

        // Add the cells to the row.
        row.appendChild(dateCell);
        row.appendChild(descriptionCell);
        row.appendChild(categoryCell);
        row.appendChild(amountCell);

        // Add the row to the table.
        tableBody.appendChild(row);
    });
}
