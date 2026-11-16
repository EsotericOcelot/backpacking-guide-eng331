const storageKey = "backpacking-predeparture-v1";

const checkboxes = [
  ...document.querySelectorAll(
    '#checklist input[name="predeparture"]'
  )
];

const progress = document.querySelector("#checklist-progress");
const saveNote = document.querySelector("#save-note");
const resetButton = document.querySelector("#reset-checklist");
const printButton = document.querySelector("#print-guide");

function updateProgress() {
  const completed = checkboxes.filter(
    checkbox => checkbox.checked
  ).length;

  progress.textContent =
    `${completed} of ${checkboxes.length} checks completed`;
}

function showStorageMessage(available) {
  saveNote.textContent = available
    ? "Checklist progress is saved in this browser."
    : "Progress cannot be saved in this browser. Keep this page open to retain your checks.";
}

function saveChecklist() {
  const selected = checkboxes
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  try {
    localStorage.setItem(storageKey, JSON.stringify(selected));
    showStorageMessage(true);
  } catch {
    showStorageMessage(false);
  }
}

function loadChecklist() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    if (Array.isArray(saved)) {
      checkboxes.forEach(checkbox => {
        checkbox.checked = saved.includes(checkbox.value);
      });
    }
  } catch {
    showStorageMessage(false);
  }

  updateProgress();
}

checkboxes.forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    updateProgress();
    saveChecklist();
  });
});

resetButton.addEventListener("click", () => {
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  updateProgress();
  saveChecklist();
});

printButton.addEventListener("click", () => {
  window.print();
});

loadChecklist();

const gearFilters = document.querySelector("#gear-filters");
const categoryFilter = document.querySelector("#gear-category");
const applicabilityFilter = document.querySelector("#gear-applicability");
const gearCards = [...document.querySelectorAll(".gear-card[data-category]")];
const gearGroups = [...document.querySelectorAll("[data-gear-group]")];
const gearCount = document.querySelector("#gear-count");
const gearEmpty = document.querySelector("#gear-empty");

function filterGear() {
  let visible = 0;

  gearCards.forEach(card => {
    const matchesCategory = categoryFilter.value === "all" ||
      categoryFilter.value === card.dataset.category;
    const matchesApplicability = applicabilityFilter.value === "all" ||
      applicabilityFilter.value === card.dataset.applicability;

    card.hidden = !(matchesCategory && matchesApplicability);
    if (!card.hidden) visible += 1;
  });

  gearGroups.forEach(group => {
    group.hidden = ![...group.querySelectorAll(".gear-card")]
      .some(card => !card.hidden);
  });

  gearCount.textContent = visible === gearCards.length
    ? `Showing all ${gearCards.length} items`
    : `Showing ${visible} of ${gearCards.length} items`;
  gearEmpty.hidden = visible !== 0;
}

categoryFilter.addEventListener("change", filterGear);
applicabilityFilter.addEventListener("change", filterGear);
document.querySelector("#clear-gear-filters").addEventListener("click", () => {
  categoryFilter.value = "all";
  applicabilityFilter.value = "all";
  filterGear();
});

filterGear();
gearFilters.hidden = false;

// Print every item's instructions, even when a filtered view is on screen.
let gearPrintState;
window.addEventListener("beforeprint", () => {
  if (gearPrintState) return;
  const details = [...document.querySelectorAll("#gear details")];
  gearPrintState = {
    category: categoryFilter.value,
    applicability: applicabilityFilter.value,
    details: details.map(element => [element, element.open])
  };
  categoryFilter.value = "all";
  applicabilityFilter.value = "all";
  filterGear();
  details.forEach(element => { element.open = true; });
});

window.addEventListener("afterprint", () => {
  if (!gearPrintState) return;
  categoryFilter.value = gearPrintState.category;
  applicabilityFilter.value = gearPrintState.applicability;
  gearPrintState.details.forEach(([element, open]) => { element.open = open; });
  gearPrintState = undefined;
  filterGear();
});
