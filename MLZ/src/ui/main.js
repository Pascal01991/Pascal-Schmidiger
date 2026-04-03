// #region Imports
import { loadProjects } from "./projectUI.js";
import { loadClients } from "./clientUI.js";

/** // @ts-check **/
/** @typedef {import("../models/ProjectModel.js").Project} Project */
//#endregion Imports

// #region Globels

const appStatus = document.getElementById("app");

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
// main.js (oder wo deine globalen Buttons verwaltet werden)

import { ApiService } from "../services/ApiService.js";
const api = new ApiService();

async function handleDatabaseReset() {
  if (!confirm("Bist du sicher? Alle Projekte und Kunden werden unwiderruflich gelöscht!")) {
    return;
  }

  try {
    setAppStatus("Setze Datenbank zurück...");
    await api.resetDatabase();

    // UI neu laden (wird nun leer sein)
    await loadProjects();
    await loadClients();

    showMessageBox("Datenbank wurde geleert.", "orange");
  } catch (error) {
    showMessageBox("Fehler beim Zurücksetzen: " + error.message, "crimson");
  }
}

// Event-Listener an einen Button binden (muss in deinem HTML existieren)
document.getElementById("deleteDatabase").addEventListener("click", handleDatabaseReset);
// #endregion Data-Management

// #region App-Start
function startApp() {
  try {
    setAppStatus("Lade Projekte...");
    loadProjects();
    loadClients();
  } catch (error) {
    setAppStatus("Fehler beim Laden der Daten.");
    showMessageBox("Fehler: " + error.message, "crimson");
    console.error(error);
  }
}

startApp();
// #endregion App-Start
