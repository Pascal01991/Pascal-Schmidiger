// #region Imports
import { loadProjects } from "./projectUI.js";
import { loadClients } from "./clientUI.js";
import { loadActivities } from "./activityUI.js";
import { initDataManagementUI } from "./dataManagementUI.js";
import { initUiPreferences } from "./uiPreferences.js";
import { AuthService } from "../services/AuthService.js";

/** // @ts-check **/
/** @typedef {import("../models/projectModel.js").Project} Project */
// #endregion Imports

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
  await reloadAppData();
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

// #region Data Loading
async function reloadAppData() {
  setAppStatus("Lade Projekte...");
  await loadProjects();
  await loadClients();
  await loadActivities();
  setAppStatus("Bereit");
}
// #endregion Data Loading

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

initUiPreferences(showMessageBox);
initDataManagementUI({
  authService,
  reloadAppData,
  setAppStatus,
  showMessageBox,
});
startApp();
// #endregion App-Start
