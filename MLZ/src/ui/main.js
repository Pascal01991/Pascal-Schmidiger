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
import { ApiService } from "../services/ApiService.js";
const api = new ApiService();

async function handleDatabaseReset() {
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
  try {
    setAppStatus("Erstelle Testdaten...");

    // 1. Beispiel-Kunden anlegen
    const client1 = await api.createClient({ name: "ACME Corp", address: "Musterstraße 1" });
    const client2 = await api.createClient({ name: "Stark Industries", address: "Malibu Point 10880" });

    // 2. Beispiel-Projekte anlegen (verknüpft mit den IDs der neuen Kunden)
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
