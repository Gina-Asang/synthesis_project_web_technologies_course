
/*
  FinWise - Savings Goals
  This file creates goals, records contributions,
  and displays savings progress.
*/

document.addEventListener("DOMContentLoaded", function () {
    // Set the contribution date to today.
    document.getElementById("contributionDate").value =
        new Date().toISOString().split("T")[0];

    // Connect both forms to their functions.
    document.getElementById("goalForm")
        .addEventListener("submit", handleGoalSubmit);

    document.getElementById("contributionForm")
        .addEventListener("submit", handleContributionSubmit);

    // Display saved goals and totals.
    displayGoalSummary();
    displayGoals();
});

// Create a new savings goal.
function handleGoalSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("goalName").value;
    const target = document.getElementById("goalTarget").value;
    const monthlySaving =
        document.getElementById("goalMonthlySaving").value;
    const deadline = document.getElementById("goalDeadline").value;

    const saved = addGoal(name, target, monthlySaving, deadline);

    if (saved) {
        document.getElementById("goalMessage").textContent =
            "Your savings goal has been created.";

        document.getElementById("goalForm").reset();

        displayGoalSummary();
        displayGoals();
    }
}

// Record a contribution to a selected goal.
function handleContributionSubmit(event) {
    event.preventDefault();

    const goalId = document.getElementById("contributionGoal").value;
    const amount = document.getElementById("contributionAmount").value;
    const date = document.getElementById("contributionDate").value;

    if (!goalId) {
        document.getElementById("contributionMessage").textContent =
            "Please select a savings goal.";
        return;
    }

    const saved = addGoalContribution(goalId, amount, date);

    if (saved) {
        document.getElementById("contributionMessage").textContent =
            "Your contribution has been recorded.";

        document.getElementById("contributionForm").reset();

        document.getElementById("contributionDate").value =
            new Date().toISOString().split("T")[0];

        displayGoalSummary();
        displayGoals();
    }
}

// Calculate and display totals for all savings goals.
function displayGoalSummary() {
    const data = getFinWiseData();

    const saved = data.goals.reduce(function (total, goal) {
        return total + Number(goal.savedAmount);
    }, 0);

    const target = data.goals.reduce(function (total, goal) {
        return total + Number(goal.targetAmount);
    }, 0);

    document.getElementById("totalSaved").textContent =
        formatCurrency(saved);

    document.getElementById("totalTarget").textContent =
        formatCurrency(target);

    document.getElementById("remainingToSave").textContent =
        formatCurrency(Math.max(target - saved, 0));
}

// Display every savings goal and populate the contribution dropdown.
function displayGoals() {
    const data = getFinWiseData();

    const goalsList = document.getElementById("goalsList");
    const goalDropdown = document.getElementById("contributionGoal");

    goalsList.innerHTML = "";
    goalDropdown.innerHTML = '<option value="">Select a goal</option>';

    if (data.goals.length === 0) {
        goalsList.textContent = "You have not created any savings goals yet.";
        return;
    }

    data.goals.forEach(function (goal) {
        // Add the goal to the contribution dropdown.
        const option = document.createElement("option");
        option.value = goal.id;
        option.textContent = goal.name;
        goalDropdown.appendChild(option);

        // Calculate the goal's completion percentage.
        const percentage = goal.targetAmount > 0
            ? (goal.savedAmount / goal.targetAmount) * 100
            : 0;

        // Create a card for this goal.
        const card = document.createElement("article");
        card.className = "goal-card";

        const title = document.createElement("h3");
        title.textContent = goal.name;

        const amount = document.createElement("p");
        amount.textContent =
            formatCurrency(goal.savedAmount) + " saved of " +
            formatCurrency(goal.targetAmount);

        const progressTrack = document.createElement("div");
        progressTrack.className = "track";

        const progressBar = document.createElement("div");
        progressBar.className = "fill";
        progressBar.style.width = Math.min(percentage, 100) + "%";

        progressTrack.appendChild(progressBar);

        const progressText = document.createElement("p");
        progressText.textContent = Math.round(percentage) + "% completed";

        card.appendChild(title);
        card.appendChild(amount);
        card.appendChild(progressTrack);
        card.appendChild(progressText);

        if (goal.deadline) {
            const deadline = document.createElement("p");
            deadline.textContent = "Target date: " + goal.deadline;
            card.appendChild(deadline);
        }

        // Allow a goal to be deleted.
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-small";
        deleteButton.textContent = "Delete Goal";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Delete this goal? Previous savings transactions will remain recorded."
            );

            if (confirmed) {
                deleteGoal(goal.id);
                displayGoalSummary();
                displayGoals();
            }
        });

        card.appendChild(deleteButton);
        goalsList.appendChild(card);
    });
}
