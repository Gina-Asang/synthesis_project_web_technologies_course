
/*
  FinWise - Reports and Planning
  This file creates spending reports and handles the calculators.
*/

document.addEventListener("DOMContentLoaded", function () {
    // Connect the calculator forms.
    document.getElementById("interestForm")
        .addEventListener("submit", calculateSimpleInterest);

    document.getElementById("savingsPlannerForm")
        .addEventListener("submit", calculateSavingsPlan);

    // Display the latest financial reports.
    displayFinancialReports();
});

// Display monthly financial figures and category reports.
function displayFinancialReports() {
    const income = getMonthlyIncome();
    const expenses = getMonthlyExpenses();
    const savings = getMonthlySavingsContributions();
    const data = getFinWiseData();

    document.getElementById("reportIncome").textContent =
        formatCurrency(income);

    document.getElementById("reportExpenses").textContent =
        formatCurrency(expenses);

    // Savings rate is the share of income allocated to savings.
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    document.getElementById("reportSavingsRate").textContent =
        Math.round(savingsRate) + "%";

    displayCategoryReport();
    displayBudgetReport(data);
}

// Group monthly expenses by category.
function displayCategoryReport() {
    const transactions = getCurrentMonthTransactions();
    const categoryTotals = {};

    transactions.forEach(function (transaction) {
        // Only include ordinary expenses, not savings contributions.
        if (transaction.type === "expense") {
            const category = transaction.category;

            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }

            categoryTotals[category] += Number(transaction.amount);
        }
    });

    const report = document.getElementById("categoryReport");
    report.innerHTML = "";

    const categories = Object.keys(categoryTotals);

    if (categories.length === 0) {
        report.textContent = "No expenses recorded for this month yet.";
        return;
    }

    categories.sort(function (first, second) {
        return categoryTotals[second] - categoryTotals[first];
    });

    categories.forEach(function (category) {
        const item = document.createElement("div");
        item.className = "report-item";

        const label = document.createElement("p");
        label.textContent =
            category + ": " + formatCurrency(categoryTotals[category]);

        item.appendChild(label);
        report.appendChild(item);
    });
}

// Compare actual spending with each category's planned budget.
function displayBudgetReport(data) {
    const report = document.getElementById("budgetReport");
    report.innerHTML = "";

    const categories = Object.keys(data.budgets);

    if (categories.length === 0) {
        report.textContent = "Set budgets on the Budget page to see comparisons.";
        return;
    }

    const transactions = getCurrentMonthTransactions();

    categories.forEach(function (category) {
        const spent = transactions
            .filter(function (transaction) {
                return transaction.type === "expense" &&
                    transaction.category === category;
            })
            .reduce(function (total, transaction) {
                return total + Number(transaction.amount);
            }, 0);

        const budget = Number(data.budgets[category]);
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;

        const item = document.createElement("div");
        item.className = "report-item";

        const label = document.createElement("p");
        label.textContent =
            category + ": " + formatCurrency(spent) +
            " spent of " + formatCurrency(budget);

        const track = document.createElement("div");
        track.className = "track";

        const bar = document.createElement("div");
        bar.className = "fill";
        bar.style.width = Math.min(percentage, 100) + "%";

        track.appendChild(bar);
        item.appendChild(label);
        item.appendChild(track);

        const status = document.createElement("p");

        if (spent > budget) {
            status.textContent =
                "Over budget by " + formatCurrency(spent - budget);
        } else {
            status.textContent =
                formatCurrency(budget - spent) + " remaining";
        }

        item.appendChild(status);
        report.appendChild(item);
    });
}

// Calculate simple interest: principal × rate × time.
function calculateSimpleInterest(event) {
    event.preventDefault();

    const principal = Number(document.getElementById("principal").value);
    const rate = Number(document.getElementById("interestRate").value);
    const years = Number(document.getElementById("interestYears").value);

    const interest = principal * (rate / 100) * years;
    const total = principal + interest;

    document.getElementById("interestResult").textContent =
        "Interest earned: " + formatCurrency(interest) +
        ". Total amount: " + formatCurrency(total) + ".";
}

// Calculate the monthly saving needed to reach a target.
function calculateSavingsPlan(event) {
    event.preventDefault();

    const target = Number(document.getElementById("plannerTarget").value);
    const alreadySaved = Number(document.getElementById("plannerSaved").value);
    const months = Number(document.getElementById("plannerMonths").value);

    if (alreadySaved > target) {
        document.getElementById("plannerResult").textContent =
            "You have already saved more than your target.";
        return;
    }

    const remaining = target - alreadySaved;
    const monthlyAmount = remaining / months;

    document.getElementById("plannerResult").textContent =
        "You need to save approximately " +
        formatCurrency(monthlyAmount) + " each month.";
}
