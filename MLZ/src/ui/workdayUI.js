// #region Imports
import { ApiService } from "../services/ApiService.js";
import {
  renderWorkdayActivityList,
  hideActivityForm,
  handleActivityListClick,
  showActivityForm,
} from "./activityUI.js";

import { getCurrentUser, showMessageBox } from "./main.js";
/** @typedef {import("../models/workday.js").workday} workday */
/** @typedef {import("../models/activity.js").activity} activity */
// #endregion Imports

// #region Globals
const api = new ApiService();
// #endregion Globals

// #region DOM References
const workdayDateInput = document.getElementById("workday-date");
const createSessionButton = document.getElementById("BtnCreateSession");
const sessionForm = document.getElementById("session-form");
const sessionFromInput = document.getElementById("session-from");
const sessionFromError = document.getElementById("session-from-error");
const sessionToInput = document.getElementById("session-to");
const sessionToError = document.getElementById("session-to-error");
const saveSessionButton = document.getElementById("BtnSaveSession");
const closeSessionFormButton = document.getElementById("BtnCloseSessionForm");
const workdaySessionItems = document.getElementById("workday-session-items");
const workdayActivityItems = document.getElementById("workday-activity-items");
const workdayTotalSessionText = document.getElementById("workday-total-session-text");
const workdayOpenHoursText = document.getElementById("workday-open-hours-text");
const workdayOpenDaysItems = document.getElementById("workday-open-days-items");
// #endregion DOM References

// #region State
let currentWorkday = null;
let currentWorkdays = [];
let currentActivities = [];
let currentDateDay = "";
let sessionEditId = null;
let hasTriedToSubmitSessionForm = false;
// #endregion State

// #region Event Listeners
workdayDateInput.addEventListener("change", onWorkdayDateChange);
createSessionButton.addEventListener("click", () => showSessionForm());
closeSessionFormButton.addEventListener("click", hideSessionForm);
sessionForm.addEventListener("submit", onSessionFormSubmit);
sessionFromInput.addEventListener("input", validateSessionFormIfNeeded);
sessionToInput.addEventListener("input", validateSessionFormIfNeeded);

workdayActivityItems.addEventListener("click", async (event) => {
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

workdayOpenDaysItems.addEventListener("click", async (event) => {
  const openDayButton = event.target.closest(".open-workday-btn");

  if (!openDayButton) {
    return;
  }

  const dateDay = openDayButton.getAttribute("data-date-day");

  if (!dateDay) {
    return;
  }

  await selectWorkdayDate(dateDay);
  showActivityForm();
});
// #endregion Event Listeners

// #region Loading

/**
 * Setzt beim ersten Laden automatisch das heutige Datum.
 */
export function setDefaultWorkdayDateIfNeeded() {
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
  if (!resetDayForms()) {
    workdayDateInput.value = currentDateDay;
    return;
  }
  await loadWorkdayForCurrentDate();
}

/**
 * Laedt den Arbeitstag des aktuellen Benutzers fuer das gewaehlte Datum.
 * @returns {Promise<void>}
 */
export async function loadWorkdayForCurrentDate() {
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

// #region Session Form
/**
 * Oeffnet das Session-Formular.
 * @param {boolean} [isEditMode=false]
 */
function showSessionForm(isEditMode = false) {
  if (!hideActivityForm()) {
    return;
  }
  sessionForm.classList.add("is-open");
  saveSessionButton.textContent = isEditMode ? "Änderung speichern" : "Session speichern";
}

/**
 * Schliesst das Session-Formular und leert die Eingaben.
 */
export function hideSessionForm(shouldAskConfirm = true) {
  if (sessionForm.classList.contains("is-open") && shouldAskConfirm) {
    const shouldCloseForm = confirm("Beim Schliessen gehen die eingegebenen Daten verloren. Weiter?");

    if (!shouldCloseForm) {
      return false;
    }
  }

  sessionForm.classList.remove("is-open");
  sessionEditId = null;
  sessionForm.reset();
  clearSessionFormErrors();
  return true;
}

/**
 * Prueft die Eingaben des Session-Formulars.
 * @returns {boolean}
 */
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

  hideSessionForm(false);
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

// #region Rendering
export function renderCurrentDayLists() {
  renderSessionDayList();
  renderWorkdayActivityList();
  renderWorkdaySummary();
  renderOpenWorkdayListWithAction();
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

function renderWorkdaySummary() {
  const sessionMinutes = getWorkdaySessionMinutes(currentWorkday);
  const openMinutes = getRoundedOpenMinutes(currentWorkday);

  workdayTotalSessionText.textContent = "Total Session: " + formatMinutesAsHours(sessionMinutes) + " h";
  workdayOpenHoursText.textContent = "Zu deklarierende Stunden: " + formatMinutesAsHours(openMinutes) + " h";
}

function renderOpenWorkdayList() {
  const openWorkdays = getOpenWorkdays();

  if (openWorkdays.length === 0) {
    workdayOpenDaysItems.innerHTML = "<p>✅ Alle Tage sind vollständig deklariert.</p>";
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
            <div>⚠️ ${formatMinutesAsHours(item.openMinutes)}h offen</div>
          </span>
        </div>
      `;
    })
    .join("");
}
// #endregion Rendering

// #region Helper
function resetDayForms() {
  if (!hideSessionForm()) {
    return false;
  }

  if (!hideActivityForm()) {
    return false;
  }

  return true;
}

/**
 * Gibt den aktuellen Arbeitstag zurueck oder legt ihn neu an.
 * @returns {Promise<workday>}
 */
export async function ensureCurrentWorkday() {
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

/**
 * Waehlt ein Datum im Datumsfeld aus und laedt danach die Tagesdaten.
 * @param {string} dateDay
 * @returns {Promise<void>}
 */
export async function selectWorkdayDate(dateDay) {
  if (!workdayDateInput) {
    return;
  }

  workdayDateInput.value = dateDay;
  await loadWorkdayForCurrentDate();
}

function getCurrentSessions() {
  if (!currentWorkday || !Array.isArray(currentWorkday.sessions)) {
    return [];
  }

  return currentWorkday.sessions;
}

/**
 * Prueft, ob sich ein Zeitraum mit bestehenden Sessions ueberschneidet.
 * Die aktuell bearbeitete Session wird ignoriert.
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
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

  // Offen ist nur die Zeit, die als Session existiert, aber noch keiner Aktivitaet zugewiesen wurde.
  const openMinutes = getWorkdaySessionMinutes(workday) - getWorkdayActivityMinutes(workday.id);
  return roundDownToQuarterHour(openMinutes);
}

/**
 * Rundet Minuten immer auf den naechstkleineren 15-Minuten-Schritt ab.
 * @param {number} minutes
 * @returns {number}
 */
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
    // Hier wird die Dauer aller Sessions eines Tages zusammengerechnet.
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

export function convertMinutesToHours(minutes) {
  return Number(minutes) / 60;
}

function isQuarterHourStep(hours) {
  const scaledValue = Number(hours) * 4;
  return Number.isInteger(scaledValue);
}

export function getWorkdayDateById(workdayId) {
  const matchingWorkday = currentWorkdays.find((item) => Number(item.id) === Number(workdayId));
  return matchingWorkday ? matchingWorkday.dateDay : "";
}

export function getCurrentDateDay() {
  return currentDateDay;
}

export function getCurrentWorkday() {
  return currentWorkday;
}

export function setCurrentActivitiesForWorkdayUI(activities) {
  currentActivities = activities;
}

function renderOpenWorkdayListWithAction() {
  const openWorkdays = getOpenWorkdays();

  if (openWorkdays.length === 0) {
    workdayOpenDaysItems.innerHTML = "<p>✅ Alle Tage sind vollständig deklariert.</p>";
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
            <div>⚠️ ${formatMinutesAsHours(item.openMinutes)}h offen</div>
          </span>
          <div class="list-field-actions">
            <button type="button" data-date-day="${
              item.dateDay
            }" class="action-btn open-workday-btn" title="Tag öffnen">📝</button>
          </div>
        </div>
      `;
    })
    .join("");
}
// #endregion Helper
