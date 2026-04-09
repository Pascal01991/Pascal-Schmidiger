// #region Imports
import { ApiService } from "../services/ApiService.js";
import { entityMatchesSearch, highlightText } from "./search.js";
import { getCurrentUser, setAppStatus, showMessageBox } from "./main.js";
import {
  setDefaultWorkdayDateIfNeeded,
  loadWorkdayForCurrentDate,
  getWorkdayDateById,
  getCurrentDateDay,
  getCurrentWorkday,
  ensureCurrentWorkday,
  selectWorkdayDate,
  hideSessionForm,
  convertMinutesToHours,
  renderCurrentDayLists,
  setCurrentActivitiesForWorkdayUI,
} from "./workdayUI.js";
/** @typedef {import("../models/workday.js").workday} workday */
/** @typedef {import("../models/activity.js").activity} activity */
// #endregion Imports

// #region Globals
const api = new ApiService();
// #endregion Globals

// #region DOM References
const activityForm = document.getElementById("activity-form-new");
const createActivityButton = document.getElementById("BtnCreateActivity");
const activityProjectSelect = document.getElementById("activity-project-select-new");
const activityProjectError = document.getElementById("activity-project-error-new");
const activityDurationHoursInput = document.getElementById("activity-duration-hours");
const activityDurationError = document.getElementById("activity-duration-error");
const activityCommentInput = document.getElementById("activity-comment");
const activityBillingInfoInput = document.getElementById("activity-billing-info");
const activityBillableInput = document.getElementById("activity-billable");
const activityBilledInput = document.getElementById("activity-billed");
const activityCreatedByLabel = document.getElementById("activity-created-by-label");
const activityCreatedByInput = document.getElementById("activity-created-by");
const saveActivityButton = document.getElementById("BtnSaveActivityNew");
const closeActivityFormButton = document.getElementById("BtnCloseActivityFormNew");
const workdayActivityItems = document.getElementById("workday-activity-items");

const activitySearchInput = document.getElementById("searchActivity");
const activitySearchProjectCheckbox = document.getElementById("search-activity-project-checkbox");
const activitySearchClientCheckbox = document.getElementById("search-activity-client-checkbox");
const activitySearchDateCheckbox = document.getElementById("search-activity-date-checkbox");
const activitySearchUserOption = document.getElementById("search-activity-user-option");
const activitySearchUserCheckbox = document.getElementById("search-activity-user-checkbox");
const activityItemsList = document.getElementById("activity-items");
// #endregion DOM References

// #region State
let currentProjects = [];
let currentClients = [];
let currentUsers = [];
let currentActivities = [];
let activityEditId = null;
let activityEditUserId = null;
let activityEditWorkdayId = null;
let hasTriedToSubmitActivityForm = false;
// #endregion State

// #region Event Listeners
createActivityButton.addEventListener("click", () => showActivityForm());
closeActivityFormButton.addEventListener("click", hideActivityForm);
activityForm.addEventListener("submit", onActivityFormSubmit);
activityProjectSelect.addEventListener("change", validateActivityFormIfNeeded);
activityDurationHoursInput.addEventListener("input", validateActivityFormIfNeeded);
activitySearchInput.addEventListener("input", renderFilteredActivityList);
activitySearchProjectCheckbox.addEventListener("change", renderFilteredActivityList);
activitySearchClientCheckbox.addEventListener("change", renderFilteredActivityList);
activitySearchDateCheckbox.addEventListener("change", renderFilteredActivityList);
activitySearchUserCheckbox.addEventListener("change", renderFilteredActivityList);

activityItemsList.addEventListener("click", async (event) => {
  await handleActivityListClick(event);
});

// #endregion Event Listeners

// #region Loading
/**
 * @param {Array<{id: number|string, name: string}>} projects
 */
export function renderProjectOptionsForTimeForm(projects) {
  activityProjectSelect.innerHTML = '<option value="">-- Bitte wählen --</option>';
  const clientLookup = {};

  for (const client of currentClients) {
    clientLookup[client.id] = client.name;
  }

  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = (clientLookup[project.clientId] || "Unbekannter Kunde") + " - " + project.name;
    activityProjectSelect.appendChild(option);
  }
}

export async function loadActivities() {
  currentProjects = await api.getProjects();
  currentClients = await api.getClients();
  currentUsers = await api.getUsers();
  currentActivities = filterActivitiesByRole(await api.getActivities());
  setCurrentActivitiesForWorkdayUI(currentActivities);

  renderProjectOptionsForTimeForm(currentProjects);
  updateActivityUserSearchVisibility();
  setDefaultWorkdayDateIfNeeded();
  await loadWorkdayForCurrentDate();
  renderFilteredActivityList();

  if (currentActivities.length === 0) {
    setAppStatus("Keine Aktivitäten erfasst.");
    return;
  }

  setAppStatus("Daten geladen.");
}
// #endregion Loading

// #region Activity Form
export function showActivityForm(isEditMode = false) {
  hideSessionForm();
  activityForm.classList.add("is-open");
  saveActivityButton.textContent = isEditMode ? "Änderung speichern" : "Aktivität speichern";
}

export function hideActivityForm() {
  activityForm.classList.remove("is-open");
  activityEditId = null;
  activityEditUserId = null;
  activityEditWorkdayId = null;
  activityForm.reset();
  hideActivityCreatedByField();
  clearActivityFormErrors();
}

function validateActivityForm() {
  let isValid = true;

  clearActivityFormErrors();

  if (activityProjectSelect.value === "") {
    activityProjectError.textContent = "Ein Projekt muss ausgewählt sein.";
    activityProjectSelect.classList.add("input-error");
    isValid = false;
  }

  const durationHours = Number(activityDurationHoursInput.value);
  const durationMinutes = convertHoursToMinutes(durationHours);

  if (!durationMinutes || durationMinutes < 15) {
    activityDurationError.textContent = "Dauer muss mindestens 15 Minuten sein.";
    activityDurationHoursInput.classList.add("input-error");
    isValid = false;
  } else if (!isQuarterHourStep(durationHours)) {
    activityDurationError.textContent = "Dauer muss im 0.25-Stunden-Takt sein.";
    activityDurationHoursInput.classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

function validateActivityFormIfNeeded() {
  if (!hasTriedToSubmitActivityForm) {
    return;
  }

  validateActivityForm();
}

function clearActivityFormErrors() {
  activityProjectError.textContent = "";
  activityDurationError.textContent = "";
  activityProjectSelect.classList.remove("input-error");
  activityDurationHoursInput.classList.remove("input-error");
  hasTriedToSubmitActivityForm = false;
}

async function onActivityFormSubmit(event) {
  event.preventDefault();
  hasTriedToSubmitActivityForm = true;

  if (!validateActivityForm()) {
    return;
  }

  if (getCurrentDateDay() === "") {
    showMessageBox("Bitte zuerst ein Datum wählen.", "crimson");
    return;
  }

  const workday = await ensureCurrentWorkday();
  const currentUser = getCurrentUser();
  const activityData = {
    workdayId: workday.id,
    userId: activityEditUserId || currentUser.id,
    projectId: Number(activityProjectSelect.value),
    comment: activityCommentInput.value.trim(),
    billingInfo: activityBillingInfoInput.value.trim(),
    durationMinutes: convertHoursToMinutes(Number(activityDurationHoursInput.value)),
    billable: activityBillableInput.checked,
    billed: activityBilledInput.checked,
  };

  if (activityEditId) {
    await api.editActivity(activityEditId, activityData);
  } else {
    await api.createActivity(activityData);
  }

  hideActivityForm();
  currentActivities = filterActivitiesByRole(await api.getActivities());
  setCurrentActivitiesForWorkdayUI(currentActivities);
  renderCurrentDayLists();
  renderFilteredActivityList();
  showMessageBox("Aktivität gespeichert!", "green");
}

export async function handleActivityListClick(event) {
  const editButton = event.target.closest(".edit-activity-btn");
  const deleteButton = event.target.closest(".delete-activity-btn");

  if (editButton) {
    const activityId = Number(editButton.getAttribute("data-activity-id"));
    const selectedActivity = currentActivities.find((item) => Number(item.id) === activityId);

    if (selectedActivity) {
      activityEditId = selectedActivity.id;
      activityEditUserId = selectedActivity.userId;
      activityEditWorkdayId = selectedActivity.workdayId;
      await selectWorkdayDate(getWorkdayDateById(selectedActivity.workdayId));
      showActivityForm(true);
      fillActivityForm(selectedActivity);
    }
  }

  if (deleteButton) {
    const activityId = Number(deleteButton.getAttribute("data-activity-id"));
    await api.deleteActivity(activityId);
    currentActivities = filterActivitiesByRole(await api.getActivities());
    setCurrentActivitiesForWorkdayUI(currentActivities);
    renderCurrentDayLists();
    renderFilteredActivityList();
    showMessageBox("Aktivität gelöscht!", "green");
  }
}

function fillActivityForm(selectedActivity) {
  activityProjectSelect.value = String(selectedActivity.projectId);
  activityDurationHoursInput.value = String(convertMinutesToHours(selectedActivity.durationMinutes));
  activityCommentInput.value = selectedActivity.comment || "";
  activityBillingInfoInput.value = selectedActivity.billingInfo || "";
  activityBillableInput.checked = selectedActivity.billable;
  activityBilledInput.checked = selectedActivity.billed;
  showActivityCreatedByField(selectedActivity.userId);
  clearActivityFormErrors();
}
// #endregion Activity Form

// #region Rendering
export function renderWorkdayActivityList() {
  const dayActivities = getCurrentDayActivities();
  const projectLookup = getProjectLookup();

  if (dayActivities.length === 0) {
    workdayActivityItems.innerHTML = "<p>Keine Aktivitäten erfasst.</p>";
    return;
  }

  workdayActivityItems.innerHTML = dayActivities
    .map((item) => {
      const projectMetaData = getActivityProjectMetaData(item, projectLookup);
      return `
        <div class="list-row">
          <span class="list-field">
            <div>${projectMetaData.clientName} / ${projectMetaData.projectName}</div>
          </span>
          <div class="list-field-actions">
            <button data-activity-id="${item.id}" class="action-btn edit-activity-btn" title="Bearbeiten">✏️</button>
            <button data-activity-id="${item.id}" class="action-btn delete-activity-btn" title="Löschen">🗑️</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderFilteredActivityList() {
  const searchText = activitySearchInput.value;
  const selectedFields = getSelectedActivitySearchFields();
  const projectLookup = getProjectLookup();
  const isManager = getCurrentUser()?.role === "manager";

  const filteredActivities = currentActivities.filter((item) => {
    const projectMetaData = getActivityProjectMetaData(item, projectLookup);
    const dateDay = getWorkdayDateById(item.workdayId);
    const userName = getUserNameById(item.userId);

    return entityMatchesSearch(
      {
        projectName: projectMetaData.projectName,
        clientName: projectMetaData.clientName,
        dateDay,
        userName,
      },
      searchText,
      selectedFields,
    );
  });

  if (filteredActivities.length === 0) {
    activityItemsList.innerHTML = "<p>Keine Aktivitäten gefunden.</p>";
    return;
  }

  activityItemsList.innerHTML = filteredActivities
    .map((item) => {
      const projectMetaData = getActivityProjectMetaData(item, projectLookup);
      const dateDay = getWorkdayDateById(item.workdayId);
      const userName = getUserNameById(item.userId);

      return `
        <div class="list-row">
          <span class="list-field">
            <div>${highlightText(projectMetaData.projectName, searchText)}</div>
            <div>${highlightText(projectMetaData.clientName, searchText)}</div>
          </span>
          <span class="list-field">
            <div>${highlightText(dateDay, searchText)}</div>
            <div>${isManager ? `<div>${highlightText(userName, searchText)}</div>` : ""}</div>
          </span>
          <div class="list-field-actions">
            <button data-activity-id="${item.id}" class="action-btn edit-activity-btn" title="Bearbeiten">✏️</button>
            <button data-activity-id="${item.id}" class="action-btn delete-activity-btn" title="Löschen">🗑️</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function getSelectedActivitySearchFields() {
  const selectedFields = [];

  if (activitySearchProjectCheckbox.checked) {
    selectedFields.push("projectName");
  }

  if (activitySearchClientCheckbox.checked) {
    selectedFields.push("clientName");
  }

  if (activitySearchDateCheckbox.checked) {
    selectedFields.push("dateDay");
  }

  if (activitySearchUserCheckbox.checked) {
    selectedFields.push("userName");
  }

  return selectedFields;
}
// #endregion Rendering

// #region Helper
function getCurrentDayActivities() {
  const currentWorkday = getCurrentWorkday();

  if (!currentWorkday) {
    return [];
  }

  return currentActivities.filter((item) => Number(item.workdayId) === Number(currentWorkday.id));
}
function getActivityProjectMetaData(item, projectLookup) {
  return (
    projectLookup[item.projectId] || {
      projectName: "Unbekanntes Projekt",
      clientName: "Unbekannter Kunde",
    }
  );
}

function filterActivitiesByRole(activities) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return [];
  }

  if (currentUser.role === "manager") {
    return activities;
  }

  return activities.filter((item) => Number(item.userId) === Number(currentUser.id));
}

function getProjectLookup() {
  const projectLookup = {};
  const clientLookup = {};

  for (const client of currentClients) {
    clientLookup[client.id] = client.name;
  }

  for (const project of currentProjects) {
    projectLookup[project.id] = {
      projectName: project.name,
      clientName: clientLookup[project.clientId] || "Unbekannter Kunde",
    };
  }

  return projectLookup;
}

function getUserNameById(userId) {
  const user = currentUsers.find((item) => Number(item.id) === Number(userId));

  if (!user) {
    return "Unbekannter Benutzer";
  }

  return user.username;
}

function updateActivityUserSearchVisibility() {
  const isManager = getCurrentUser()?.role === "manager";
  activitySearchUserOption.style.display = isManager ? "inline-flex" : "none";
  activitySearchUserCheckbox.checked = false;
}

function showActivityCreatedByField(userId) {
  activityCreatedByLabel.style.display = "block";
  activityCreatedByInput.style.display = "block";
  activityCreatedByInput.value = getUserNameById(userId);
}

function hideActivityCreatedByField() {
  activityCreatedByLabel.style.display = "none";
  activityCreatedByInput.style.display = "none";
  activityCreatedByInput.value = "";
}

function convertHoursToMinutes(hours) {
  return Math.round(Number(hours) * 60);
}

function isQuarterHourStep(hours) {
  const scaledValue = Number(hours) * 4;
  return Number.isInteger(scaledValue);
}

// #endregion Helper
