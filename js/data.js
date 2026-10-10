
/* 
  FinWise - Shared Data System
  This file manages the data used throughout the application.
  localStorage allows the data to remain saved in the browser.
*/

// The name used to store FinWise data in the browser.
const FINWISE_STORAGE_KEY = "finwiseData";

// Create the default structure for our financial data.
function getDefaultData() {
    return {
        transactions: [],
        budgets: {},
        goals: []
    };
}

// Get saved data from localStorage.
function getFinWiseData() {
    const savedData = localStorage.getItem(FINWISE_STORAGE_KEY);

    // If no data has been saved yet, start with an empty system.
    if (!savedData) {
        return getDefaultData();
    }

    // Convert the saved JSON text back into a JavaScript object.
    try {
        const data = JSON.parse(savedData);

        // Make sure all the required sections exist.
        return {
            transactions: Array.isArray(data.transactions)
                ? data.transactions : [],
            budgets: data.budgets && typeof data.budgets === "object"
                ? data.budgets : {},
            goals: Array.isArray(data.goals)
                ? data.goals : []
        };
    } catch (error) {
        // If saved data cannot be read, start with an empty structure.
        console.error("Could not read FinWise data:", error);
        return getDefaultData();
    }
}

// Save the complete financial data object to localStorage.
function saveFinWiseData(data) {
    localStorage.setItem(
        FINWISE_STORAGE_KEY,
        JSON.stringify(data)
    );
}

// Format numbers as Ghanaian cedi amounts.
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2
    }).format(Number(amount) || 0);
}

// Get the current month in YYYY-MM format.
function getCurrentMonth() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}

// Get all transactions recorded in the current month.
function getCurrentMonthTransactions() {
    const data = getFinWiseData();
    const currentMonth = getCurrentMonth();

    return data.transactions.filter(function (transaction) {
        return transaction.date &&
            transaction.date.startsWith(currentMonth);
    });
}

// Calculate the total income for the current month.
function getMonthlyIncome() {
    const transactions = getCurrentMonthTransactions();

    return transactions
        .filter(function (transaction) {
            return transaction.type === "income";
        })
        .reduce(function (total, transaction) {
            return total + Number(transaction.amount);
        }, 0);
}

// Calculate normal expenses for the current month.
// Savings contributions are kept separate from everyday spending.
function getMonthlyExpenses() {
    const transactions = getCurrentMonthTransactions();

    return transactions
        .filter(function (transaction) {
            return transaction.type === "expense";
        })
        .reduce(function (total, transaction) {
            return total + Number(transaction.amount);
        }, 0);
}

// Calculate savings contributions made this month.
function getMonthlySavingsContributions() {
    const transactions = getCurrentMonthTransactions();

    return transactions
        .filter(function (transaction) {
            return transaction.type === "savings";
        })
        .reduce(function (total, transaction) {
            return total + Number(transaction.amount);
        }, 0);
}

// Calculate the money remaining after expenses and savings contributions.
function getMonthlyBalance() {
    return getMonthlyIncome()
        - getMonthlyExpenses()
        - getMonthlySavingsContributions();
}

// Add an income, expense, or savings transaction.
function addTransaction(type, description, category, amount, date) {
    const data = getFinWiseData();

    // Check that the amount is valid.
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        alert("Please enter an amount greater than zero.");
        return false;
    }

    // Create a new transaction.
    const transaction = {
        id: Date.now().toString(),
        type: type,
        description: description.trim(),
        category: category,
        amount: Number(amount),
        date: date
    };

    // Add the transaction to the shared transaction list.
    data.transactions.push(transaction);

    // Save the updated data.
    saveFinWiseData(data);

    return true;
}

// Delete a transaction using its unique ID.
function deleteTransaction(transactionId) {
    const data = getFinWiseData();

    data.transactions = data.transactions.filter(function (transaction) {
        return transaction.id !== transactionId;
    });

    saveFinWiseData(data);
}

// Save or update a monthly budget for a category.
function setBudget(category, amount) {
    const data = getFinWiseData();

    if (!category || !Number.isFinite(Number(amount)) || Number(amount) < 0) {
        alert("Please enter a valid category and budget amount.");
        return false;
    }

    data.budgets[category] = Number(amount);

    saveFinWiseData(data);

    return true;
}

// Create a new savings goal.
function addGoal(name, targetAmount, monthlySaving, deadline) {
    const data = getFinWiseData();

    if (
        !name.trim() ||
        !Number.isFinite(Number(targetAmount)) ||
        Number(targetAmount) <= 0 ||
        !Number.isFinite(Number(monthlySaving)) ||
        Number(monthlySaving) < 0
    ) {
        alert("Please enter a goal name, a valid target, and a valid monthly saving amount.");
        return false;
    }

    const goal = {
        id: Date.now().toString(),
        name: name.trim(),
        targetAmount: Number(targetAmount),
        savedAmount: 0,
        monthlySaving: Number(monthlySaving),
        deadline: deadline || ""
    };

    data.goals.push(goal);

    saveFinWiseData(data);

    return true;
}

// Add money towards an existing savings goal.
// The contribution is also recorded as a savings transaction.
function addGoalContribution(goalId, amount, date) {
    const data = getFinWiseData();

    const goal = data.goals.find(function (item) {
        return item.id === goalId;
    });

    if (!goal) {
        alert("Savings goal not found.");
        return false;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        alert("Please enter a contribution greater than zero.");
        return false;
    }

    // Do not allow the saved amount to exceed the goal target.
    if (goal.savedAmount + Number(amount) > goal.targetAmount) {
        alert("This contribution is greater than the amount remaining to reach your goal.");
        return false;
    }

    // Update the amount saved towards the goal.
    goal.savedAmount += Number(amount);

    // Record the contribution so the dashboard balance also updates.
    data.transactions.push({
        id: Date.now().toString(),
        type: "savings",
        description: "Contribution to " + goal.name,
        category: "Savings",
        amount: Number(amount),
        date: date
    });

    saveFinWiseData(data);

    return true;
}

// Delete a savings goal.
function deleteGoal(goalId) {
    const data = getFinWiseData();

    data.goals = data.goals.filter(function (goal) {
        return goal.id !== goalId;
    });

    saveFinWiseData(data);
}
