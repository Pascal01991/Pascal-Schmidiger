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
