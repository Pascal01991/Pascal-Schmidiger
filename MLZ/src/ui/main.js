// #region Imports
import { loadProjects } from "./projectUI.js";
import { loadClients } from "./clientUI.js";
import { AuthService } from "../services/AuthService.js";

/** // @ts-check **/
/** @typedef {import("../models/ProjectModel.js").Project} Project */
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
const managerOnlySections = document.querySelectorAll("[data-manager-only='true']");
const authService = new AuthService();

export function setAppStatus(text) {
  appStatus.textContent = text;
}
// #endregion Globels

// #region Helper
const message = document.getElementById("message-box");

export function showMessageBox(text, color) {
  message.textContent = text;
  message.style.backgroundColor = color;
  message.style.display = "block";
  setTimeout(() => {
    message.style.display = "none";
  }, 3000);
}
// #endregion Helper

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

  try {
    setAppStatus("Setze Datenbank zurück...");
    await api.resetDatabase();

    await loadProjects();
    await loadClients();

    showMessageBox("Datenbank wurde geleert.", "orange");
  } catch (error) {
    showMessageBox("Fehler beim Zurücksetzen: " + error.message, "crimson");
  }
}

document.getElementById("deleteDatabase").addEventListener("click", handleDatabaseReset);

async function handleCreateTestData() {
  if (!authService.isManager()) {
    showMessageBox("Nur Manager duerfen Testdaten erstellen.", "crimson");
    return;
  }
  try {
    setAppStatus("Erstelle Testdaten...");

    const client1 = await api.createClient({ name: "ACME Corp", address: "Musterstraße 1" });
    const client2 = await api.createClient({ name: "Stark Industries", address: "Malibu Point 10880" });

    await api.createProject({
      name: "Website Relaunch",
      clientId: client1.id,
      completed: false,
    });
    await api.createProject({
      name: "Iron Man Suit Maintenance",
      clientId: client2.id,
      completed: true,
    });
    await api.createProject({
      name: "Logo Design",
      clientId: client1.id,
      completed: false,
    });

    // 3. UI aktualisieren
    await loadProjects();
    await loadClients();

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
function getUserDisplayText(user) {
  return user.loginDisplayName + " (" + user.role + ")";
}

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
  currentUserInfo.textContent = "Angemeldet als: " + getUserDisplayText(user);
  applyRoleVisibility();
}

async function initializeAppForUser(user) {
  showAppView(user);
  setAppStatus("Lade Projekte...");
  await loadProjects();
  await loadClients();
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
