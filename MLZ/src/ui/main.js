// #region Imports
import { loadProjects } from "./projectUI.js";
import { loadClients } from "./clientUI.js";
import { loadActivities } from "./activityUI.js";
import { AuthService } from "../services/AuthService.js";

/** // @ts-check **/
/** @typedef {import("../models/projectModel.js").Project} Project */
//#endregion Imports

// #region Globels
const appStatus = document.getElementById("app");
const loginSection = document.getElementById("login-section");
const appShell = document.getElementById("app-shell");
const loginForm = document.getElementById("login-form");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginError = document.getElementById("login-error");
const currentUserInfo = document.getElementById("current-user-info");
const logoutButton = document.getElementById("logout-button");
const themeToggle = document.getElementById("theme-toggle");
const managerOnlySections = document.querySelectorAll("[data-manager-only='true']");
const authService = new AuthService();
const THEME_STORAGE_KEY = "theme";

export function setAppStatus(text) {
  appStatus.textContent = text;
}

export function getCurrentUser() {
  return authService.getCurrentUser();
}
// #endregion Globels

// #region Helper
const message = document.getElementById("message-box");

export function showMessageBox(text, color) {
  message.textContent = text;
  message.style.backgroundColor = color;
  message.classList.add("is-visible");
  setTimeout(() => {
    message.classList.remove("is-visible");
  }, 3000);
}
// #endregion Helper

// #region Theme
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.checked = theme === "dark";
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = savedTheme === "dark" ? "dark" : "light";
  applyTheme(theme);
}

function handleThemeToggleChange() {
  const theme = themeToggle.checked ? "dark" : "light";
  applyTheme(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

themeToggle.addEventListener("change", handleThemeToggleChange);
loadSavedTheme();
// #endregion Theme

// #region Data-Management
import { ApiService } from "../services/ApiService.js";
const api = new ApiService();

async function handleDatabaseReset() {
  if (!authService.isManager()) {
    showMessageBox("Nur Manager duerfen Daten-Management nutzen.", "crimson");
    return;
  }
  if (!confirm("Bist du sicher? Alle Projekte und Kunden werden unwiderruflich gelöscht!")) {
    return;
  }
  deleteDatabase.disabled = true;
  createTestData.disabled = true;
  setTimeout(() => {
    deleteDatabase.disabled = false;
    createTestData.disabled = false;
  }, 3000);

  try {
    setAppStatus("Setze Datenbank zurück...");
    await api.resetDatabase();
    console.log("Datenbank zurückgesetzt, lade Daten neu...");
    await loadProjects();
    console.log("Projekte neu geladen.");
    await loadClients();
    console.log("Kunden neu geladen.");
    await loadActivities();

    showMessageBox("Datenbank wurde geleert.", "orange");
    console.log("MessageBox angezeigt.");
  } catch (error) {
    showMessageBox("Fehler beim Zurücksetzen: " + error.message, "crimson");
  }
}

document.getElementById("deleteDatabase").addEventListener("click", handleDatabaseReset);

async function handleCreateTestData() {
  console.log("handleCreateTestData aufgerufen");

  if (!authService.isManager()) {
    showMessageBox("Nur Manager duerfen Testdaten erstellen.", "crimson");
    return;
  }
  try {
    setAppStatus("Erstelle Testdaten...");

    deleteDatabase.disabled = true;
    createTestData.disabled = true;
    setTimeout(() => {
      deleteDatabase.disabled = false;
      createTestData.disabled = false;
    }, 3000);

    const client1 = await api.createClient({
      name: "Elektro Müller GmbH",
      address: "Musterstraße 1",
      externalReference: "",
      active: true,
    });

    const client2 = await api.createClient({
      name: "Mahler Matter AG",
      address: "Bahnhofstrasse 5, 6000 Luzern",
      externalReference: "",
      active: true,
    });

    const client3 = await api.createClient({
      name: "Intern",
      address: "",
      externalReference: "",
      active: true,
    });

    const project1 = await api.createProject({
      name: "Spesen App",
      externalReference: "",
      clientId: client1.id,
      completed: false,
    });

    await api.createProject({
      name: "Zeiterfassungstool",
      externalReference: "",
      clientId: client2.id,
      completed: true,
    });

    const project3 = await api.createProject({
      name: "Webseite Unternehmenspräsentation",
      externalReference: "",
      clientId: client1.id,
      completed: false,
    });

    const project4 = await api.createProject({
      name: "Administrativer Aufwand",
      externalReference: "",
      clientId: client3.id,
      completed: false,
    });

    const workday1 = await api.createWorkday({
      userId: 1,
      dateDay: "2026-04-06",
      totalMinutes: 180,
      sessions: [
        { id: 1, from: "08:00", to: "10:00" },
        { id: 2, from: "13:00", to: "14:00" },
      ],
    });

    await api.createActivity({
      workdayId: workday1.id,
      userId: 1,
      projectId: project1.id,
      comment: "Kickoff",
      billingInfo: "",
      durationMinutes: 60,
      billable: true,
      billed: false,
    });

    await api.createActivity({
      workdayId: workday1.id,
      userId: 1,
      projectId: project3.id,
      comment: "Konzept",
      billingInfo: "",
      durationMinutes: 60,
      billable: true,
      billed: false,
    });

    await loadProjects();
    await loadClients();
    await loadActivities();

    showMessageBox("Testdaten erfolgreich erstellt!", "green");
    setAppStatus("Bereit");
  } catch (error) {
    showMessageBox("Fehler beim Erstellen der Testdaten: " + error.message, "crimson");
    console.error(error);
  }
}

document.getElementById("createTestData").addEventListener("click", handleCreateTestData);
// #endregion Data-Management

// #region Auth
function applyRoleVisibility() {
  const isManager = authService.isManager();

  managerOnlySections.forEach((section) => {
    section.style.display = isManager ? "block" : "none";
  });
}

function showLoginView() {
  loginSection.style.display = "block";
  appShell.style.display = "none";
  currentUserInfo.textContent = "";
}

function showAppView(user) {
  loginSection.style.display = "none";
  appShell.style.display = "block";
  currentUserInfo.textContent = user.username;
  applyRoleVisibility();
}

async function initializeAppForUser(user) {
  showAppView(user);
  setAppStatus("Lade Projekte...");
  await loadProjects();
  await loadClients();
  await loadActivities();
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  loginError.textContent = "";

  try {
    const user = await authService.login(loginUsernameInput.value.trim(), loginPasswordInput.value);
    loginForm.reset();
    await initializeAppForUser(user);
    showMessageBox("Login erfolgreich.", "green");
  } catch (error) {
    loginError.textContent = error.message;
    showMessageBox(error.message, "crimson");
  }
}

function handleLogout() {
  authService.logout();
  showLoginView();
  setAppStatus("Bitte anmelden.");
  showMessageBox("Du wurdest abgemeldet.", "orange");
}

loginForm.addEventListener("submit", handleLoginSubmit);
logoutButton.addEventListener("click", handleLogout);
// #endregion Auth

// #region App-Start
async function startApp() {
  try {
    setAppStatus("Pruefe Session...");
    const user = await authService.restoreSession();

    if (!user) {
      showLoginView();
      setAppStatus("Bitte anmelden.");
      return;
    }

    await initializeAppForUser(user);
  } catch (error) {
    setAppStatus("Fehler beim Laden der Daten.");
    showMessageBox("Fehler: " + error.message, "crimson");
    console.error(error);
  }
}

startApp();
// #endregion App-Start
