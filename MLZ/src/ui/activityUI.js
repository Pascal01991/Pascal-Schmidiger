// #region Imports
import { ApiService } from "../services/ApiService.js";
import { entityMatchesSearch, highlightText } from "./search.js";
import { getCurrentUser, setAppStatus, showMessageBox } from "./main.js";
/** @typedef {import("../models/workday.js").workday} workday */
/** @typedef {import("../models/activity.js").activity} activity */
// #endregion Imports

// #region Globals
const api = new ApiService();
// #endregion Globals

// #region DOM References
const workdayDateInput = document.getElementById("workday-date");
const createSessionButton = document.getElementById("BtnCreateSession");
const createActivityButton = document.getElementById("BtnCreateActivity");

const sessionForm = document.getElementById("session-form");
const sessionFromInput = document.getElementById("session-from");
const sessionFromError = document.getElementById("session-from-error");
const sessionToInput = document.getElementById("session-to");
const sessionToError = document.getElementById("session-to-error");
const saveSessionButton = document.getElementById("BtnSaveSession");
const closeSessionFormButton = document.getElementById("BtnCloseSessionForm");

const activityForm = document.getElementById("activity-form-new");
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

const workdaySessionItems = document.getElementById("workday-session-items");
const workdayActivityItems = document.getElementById("workday-activity-items");
const workdayTotalSessionText = document.getElementById("workday-total-session-text");
const workdayOpenHoursText = document.getElementById("workday-open-hours-text");
const workdayOpenDaysItems = document.getElementById("workday-open-days-items");
const activitySearchInput = document.getElementById("searchActivity");
const activitySearchProjectCheckbox = document.getElementById("search-activity-project-checkbox");
const activitySearchClientCheckbox = document.getElementById("search-activity-client-checkbox");
const activitySearchDateCheckbox = document.getElementById("search-activity-date-checkbox");
const activitySearchUserOption = document.getElementById("search-activity-user-option");
const activitySearchUserCheckbox = document.getElementById("search-activity-user-checkbox");
const activityItemsList = document.getElementById("activity-items");
// #endregion DOM References

// #region State
let currentWorkday = null;
let currentWorkdays = [];
let currentProjects = [];
let currentClients = [];
let currentUsers = [];
let currentActivities = [];
let currentDateDay = "";
let sessionEditId = null;
let activityEditId = null;
let activityEditUserId = null;
let activityEditWorkdayId = null;
let hasTriedToSubmitSessionForm = false;
let hasTriedToSubmitActivityForm = false;
// #endregion State

// #region Event Listeners
workdayDateInput.addEventListener("change", onWorkdayDateChange);
createSessionButton.addEventListener("click", () => showSessionForm());
createActivityButton.addEventListener("click", () => showActivityForm());
closeSessionFormButton.addEventListener("click", hideSessionForm);
closeActivityFormButton.addEventListener("click", hideActivityForm);
sessionForm.addEventListener("submit", onSessionFormSubmit);
activityForm.addEventListener("submit", onActivityFormSubmit);
sessionFromInput.addEventListener("input", validateSessionFormIfNeeded);
sessionToInput.addEventListener("input", validateSessionFormIfNeeded);
activityProjectSelect.addEventListener("change", validateActivityFormIfNeeded);
activityDurationHoursInput.addEventListener("input", validateActivityFormIfNeeded);
activitySearchInput.addEventListener("input", renderFilteredActivityList);
activitySearchProjectCheckbox.addEventListener("change", renderFilteredActivityList);
activitySearchClientCheckbox.addEventListener("change", renderFilteredActivityList);
activitySearchDateCheckbox.addEventListener("change", renderFilteredActivityList);
activitySearchUserCheckbox.addEventListener("change", renderFilteredActivityList);
workdayActivityItems.addEventListener("click", async (event) => {
  await handleActivityListClick(event);
});
activityItemsList.addEventListener("click", async (event) => {
  await handleActivityListClick(event);
});

/** Delegierter Klick-Handler fuer die dynamisch gerenderte Sessionliste. Dadurch funktionieren Bearbeiten und Loeschen auch nach jedem Neu-Rendern. */
workdaySessionItems.addEventListener("click", async (event) => {
  const editButton = event.target.closest(".edit-session-btn");
  const deleteButton = event.target.closest(".delete-session-btn");

  if (editButton) {
    const sessionId = Number(editButton.getAttribute("data-session-id"));
    const session = getCurrentSessions().find((item) => Number(item.id) === sessionId);

    if (session) {
      sessionEditId = session.id;
      showSessionForm(true);
      sessionFromInput.value = session.from;
      sessionToInput.value = session.to;
    }
  }

  if (deleteButton) {
    const sessionId = Number(deleteButton.getAttribute("data-session-id"));
    await deleteSession(sessionId);
  }
});
// #endregion Event Listeners

// #region Loading
/**
 * @param {Array<{id: number|string, name: string}>} projects
 */
export function renderProjectOptionsForTimeForm(projects) {
  activityProjectSelect.innerHTML = '<option value="">-- Bitte wählen --</option>';

  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    activityProjectSelect.appendChild(option);
  }
}

export async function loadActivities() {
  currentProjects = await api.getProjects();
  currentClients = await api.getClients();
  currentUsers = await api.getUsers();
  currentActivities = filterActivitiesByRole(await api.getActivities());

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

function setDefaultWorkdayDateIfNeeded() {
  if (!workdayDateInput || workdayDateInput.value !== "") {
    return;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  workdayDateInput.value = year + "-" + month + "-" + day;
}

async function onWorkdayDateChange() {
  resetDayForms();
  await loadWorkdayForCurrentDate();
}

async function loadWorkdayForCurrentDate() {
  const currentUser = getCurrentUser();

  if (!currentUser || !workdayDateInput) {
    return;
  }

  currentDateDay = workdayDateInput.value;

  if (currentDateDay === "") {
    currentWorkday = null;
    renderCurrentDayLists();
    return;
  }

  const workdays = await api.getWorkdays();
  currentWorkdays = workdays;
  currentWorkday = workdays.find((item) => item.userId === currentUser.id && item.dateDay === currentDateDay) || null;
  renderCurrentDayLists();
}
// #endregion Loading

// #region Session Form
function showSessionForm(isEditMode = false) {
  hideActivityForm();
  sessionForm.classList.add("is-open");
  saveSessionButton.textContent = isEditMode ? "Änderung speichern" : "Session speichern";
}

function hideSessionForm() {
  sessionForm.classList.remove("is-open");
  sessionEditId = null;
  sessionForm.reset();
  clearSessionFormErrors();
}

function validateSessionForm() {
  let isValid = true;

  clearSessionFormErrors();

  if (sessionFromInput.value === "") {
    sessionFromError.textContent = "Zeit von ist ein Pflichtfeld.";
    sessionFromInput.classList.add("input-error");
    isValid = false;
  }

  if (sessionToInput.value === "") {
    sessionToError.textContent = "Zeit bis ist ein Pflichtfeld.";
    sessionToInput.classList.add("input-error");
    isValid = false;
  }

  if (
    sessionFromInput.value !== "" &&
    sessionToInput.value !== "" &&
    getMinutesBetween(sessionFromInput.value, sessionToInput.value) <= 0
  ) {
    sessionToError.textContent = "Zeit bis muss nach Zeit von liegen.";
    sessionToInput.classList.add("input-error");
    isValid = false;
  }

  if (
    sessionFromInput.value !== "" &&
    sessionToInput.value !== "" &&
    getMinutesBetween(sessionFromInput.value, sessionToInput.value) > 0 &&
    hasSessionOverlap(sessionFromInput.value, sessionToInput.value)
  ) {
    sessionToError.textContent = "In diesem Zeitraum ist bereits eine Session erfasst.";
    sessionToInput.classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

function validateSessionFormIfNeeded() {
  if (!hasTriedToSubmitSessionForm) {
    return;
  }

  validateSessionForm();
}

function clearSessionFormErrors() {
  sessionFromError.textContent = "";
  sessionToError.textContent = "";
  sessionFromInput.classList.remove("input-error");
  sessionToInput.classList.remove("input-error");
  hasTriedToSubmitSessionForm = false;
}

async function onSessionFormSubmit(event) {
  event.preventDefault();
  hasTriedToSubmitSessionForm = true;

  if (!validateSessionForm()) {
    return;
  }

  if (currentDateDay === "") {
    showMessageBox("Bitte zuerst ein Datum wählen.", "crimson");
    return;
  }

  const workday = await ensureCurrentWorkday();
  const sessions = [...workday.sessions];
  const sessionData = {
    id: sessionEditId || Date.now(),
    from: sessionFromInput.value,
    to: sessionToInput.value,
  };

  if (sessionEditId) {
    const sessionIndex = sessions.findIndex((item) => Number(item.id) === Number(sessionEditId));
    sessions[sessionIndex] = sessionData;
  } else {
    sessions.push(sessionData);
  }

  workday.sessions = sessions;
  workday.totalMinutes = calculateTotalMinutes(sessions);
  await api.editWorkday(workday.id, workday);

  hideSessionForm();
  await loadWorkdayForCurrentDate();
  showMessageBox("Session gespeichert!", "green");
}

async function deleteSession(sessionId) {
  if (!currentWorkday) {
    return;
  }

  currentWorkday.sessions = currentWorkday.sessions.filter((item) => Number(item.id) !== Number(sessionId));
  currentWorkday.totalMinutes = calculateTotalMinutes(currentWorkday.sessions);
  await api.editWorkday(currentWorkday.id, currentWorkday);
  await loadWorkdayForCurrentDate();
  showMessageBox("Session gelöscht!", "green");
}
// #endregion Session Form

// #region Activity Form
function showActivityForm(isEditMode = false) {
  hideSessionForm();
  activityForm.classList.add("is-open");
  saveActivityButton.textContent = isEditMode ? "Änderung speichern" : "Aktivität speichern";
}

function hideActivityForm() {
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

  if (currentDateDay === "") {
    showMessageBox("Bitte zuerst ein Datum wählen.", "crimson");
    return;
  }

  const workday = await ensureCurrentWorkday();
  const currentUser = getCurrentUser();
  const activityData = {
    workdayId: activityEditWorkdayId || workday.id,
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
  renderCurrentDayLists();
  renderFilteredActivityList();
  showMessageBox("Aktivität gespeichert!", "green");
}

async function handleActivityListClick(event) {
  const editButton = event.target.closest(".edit-activity-btn");
  const deleteButton = event.target.closest(".delete-activity-btn");

  if (editButton) {
    const activityId = Number(editButton.getAttribute("data-activity-id"));
    const selectedActivity = currentActivities.find((item) => Number(item.id) === activityId);

    if (selectedActivity) {
      activityEditId = selectedActivity.id;
      activityEditUserId = selectedActivity.userId;
      activityEditWorkdayId = selectedActivity.workdayId;
      showActivityForm(true);
      fillActivityForm(selectedActivity);
    }
  }

  if (deleteButton) {
    const activityId = Number(deleteButton.getAttribute("data-activity-id"));
    await api.deleteActivity(activityId);
    currentActivities = filterActivitiesByRole(await api.getActivities());
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
function renderCurrentDayLists() {
  renderSessionDayList();
  renderWorkdayActivityList();
  renderWorkdaySummary();
  renderOpenWorkdayList();
}

function renderSessionDayList() {
  const sessions = getCurrentSessions();

  if (sessions.length === 0) {
    workdaySessionItems.innerHTML = "<p>Keine Sessions erfasst.</p>";
    return;
  }

  workdaySessionItems.innerHTML = sessions
    .map((session) => {
      return `
        <div class="list-row">
          <span class="list-field">
            <div>${session.from} - ${session.to}</div>
          </span>
          <div class="list-field-actions">
            <button data-session-id="${session.id}" class="action-btn edit-session-btn" title="Bearbeiten">✏️</button>
            <button data-session-id="${session.id}" class="action-btn delete-session-btn" title="Löschen">🗑️</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderWorkdayActivityList() {
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

function renderWorkdaySummary() {
  const sessionMinutes = getWorkdaySessionMinutes(currentWorkday);
  const openMinutes = getRoundedOpenMinutes(currentWorkday);

  workdayTotalSessionText.textContent = "Total Session: " + formatMinutesAsHours(sessionMinutes) + " h";
  workdayOpenHoursText.textContent = "Also zu deklarierende Stunden: " + formatMinutesAsHours(openMinutes) + " h";
}

function renderOpenWorkdayList() {
  const openWorkdays = getOpenWorkdays();

  if (openWorkdays.length === 0) {
    workdayOpenDaysItems.innerHTML = "<p>Alle Tage sind vollständig deklariert.</p>";
    return;
  }

  workdayOpenDaysItems.innerHTML = openWorkdays
    .map((item) => {
      return `
        <div style='color: red;' class="list-row">
          <span class="list-field">
            <div>${item.dateDay}</div>
          </span>  
          <span class="list-field">
            <div>⚠️${formatMinutesAsHours(item.openMinutes)}h offen</div>
          </span>
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
function resetDayForms() {
  hideSessionForm();
  hideActivityForm();
}

async function ensureCurrentWorkday() {
  if (currentWorkday) {
    return currentWorkday;
  }

  const currentUser = getCurrentUser();

  currentWorkday = await api.createWorkday({
    userId: currentUser.id,
    dateDay: currentDateDay,
    totalMinutes: 0,
    sessions: [],
  });
  currentWorkdays.push(currentWorkday);

  return currentWorkday;
}

function getCurrentSessions() {
  if (!currentWorkday || !Array.isArray(currentWorkday.sessions)) {
    return [];
  }

  return currentWorkday.sessions;
}

//Prüft, ob sich ein neuer Zeitraum mit bestehenden Sessions überschneidet (ignoriert die aktuell bearbeitete Session).
function hasSessionOverlap(from, to) {
  const newFromMinutes = getTimeAsMinutes(from);
  const newToMinutes = getTimeAsMinutes(to);

  return getCurrentSessions().some((session) => {
    if (sessionEditId && Number(session.id) === Number(sessionEditId)) {
      return false;
    }

    const sessionFromMinutes = getTimeAsMinutes(session.from);
    const sessionToMinutes = getTimeAsMinutes(session.to);

    return newFromMinutes < sessionToMinutes && newToMinutes > sessionFromMinutes;
  });
}

function getCurrentDayActivities() {
  if (!currentWorkday) {
    return [];
  }

  return currentActivities.filter((item) => Number(item.workdayId) === Number(currentWorkday.id));
}

function getWorkdaySessionMinutes(workday) {
  if (!workday || !Array.isArray(workday.sessions)) {
    return 0;
  }

  return calculateTotalMinutes(workday.sessions);
}

function getWorkdayActivityMinutes(workdayId) {
  let totalMinutes = 0;

  for (const activity of currentActivities) {
    if (Number(activity.workdayId) === Number(workdayId)) {
      totalMinutes += Number(activity.durationMinutes) || 0;
    }
  }

  return totalMinutes;
}

function getRoundedOpenMinutes(workday) {
  if (!workday) {
    return 0;
  }

  const openMinutes = getWorkdaySessionMinutes(workday) - getWorkdayActivityMinutes(workday.id);
  return roundDownToQuarterHour(openMinutes);
}

function roundDownToQuarterHour(minutes) {
  const quarterHourMinutes = Number(minutes) || 0;
  return Math.floor(quarterHourMinutes / 15) * 15;
}

function formatMinutesAsHours(minutes) {
  return String(convertMinutesToHours(minutes));
}

function getOpenWorkdays() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return [];
  }

  return currentWorkdays
    .filter((item) => Number(item.userId) === Number(currentUser.id))
    .map((item) => {
      return {
        dateDay: item.dateDay,
        openMinutes: getRoundedOpenMinutes(item),
      };
    })
    .filter((item) => item.openMinutes >= 15)
    .sort((left, right) => left.dateDay.localeCompare(right.dateDay));
}

function calculateTotalMinutes(sessions) {
  let totalMinutes = 0;

  for (const session of sessions) {
    totalMinutes += getMinutesBetween(session.from, session.to);
  }

  return totalMinutes;
}

function getMinutesBetween(from, to) {
  const fromMinutes = getTimeAsMinutes(from);
  const toMinutes = getTimeAsMinutes(to);

  return toMinutes - fromMinutes;
}

function getTimeAsMinutes(timeValue) {
  const timeParts = timeValue.split(":");
  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);

  return hours * 60 + minutes;
}

function convertHoursToMinutes(hours) {
  return Math.round(Number(hours) * 60);
}

function convertMinutesToHours(minutes) {
  return Number(minutes) / 60;
}

function isQuarterHourStep(hours) {
  const scaledValue = Number(hours) * 4;
  return Number.isInteger(scaledValue);
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

function getWorkdayDateById(workdayId) {
  const matchingWorkday = currentWorkdays.find((item) => Number(item.id) === Number(workdayId));
  return matchingWorkday ? matchingWorkday.dateDay : "";
}

function getUserNameById(userId) {
  const user = currentUsers.find((item) => Number(item.id) === Number(userId));

  if (!user) {
    return "Unbekannter Benutzer";
  }

  return user.loginDisplayName;
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
// #endregion Helper
