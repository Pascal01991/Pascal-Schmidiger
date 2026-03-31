// #region Imports
import { loadProjects } from "./projectUi.js";
// #endregion Imports

// #region JS-Doc
/** // @ts-check **/
import { ApiService } from "../services/ApiService.js";
/** @typedef {import("../models/ProjectModel.js").Project} Project */
//#endregion JS-Doc

// #region Globels
const api = new ApiService();
const appStatus = document.getElementById("app");

function setAppStatus(text) {
  appStatus.textContent = text;
}
// #endregion Globels

// #region Helper
const message = document.getElementById("message-box");

function showMessageBox(text, color) {
  message.textContent = text;
  message.style.backgroundColor = color;
  message.style.display = "block";
  setTimeout(() => {
    message.style.display = "none";
  }, 3000);
}
// #endregion Helper

// #region Time in Project

const projectSelect = document.getElementById("project-select");

/**
 * @param {Project[]} projects
 */
function renderProjectOptionsForTimeForm(projects) {
  projectSelect.innerHTML = '<option value="">-- Bitte waehlen --</option>';

  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    projectSelect.appendChild(option);
  }
}

// #endregion Time in Project

// #region Kundenverwaltung
const clientForm = document.getElementById("client-form");
const clientNameInput = document.getElementById("client-name");
const clientAddressInput = document.getElementById("client-address");

async function loadClients() {
  const clients = await api.getClients();

  renderClientOptionsForProjectForm(clients);

  if (clients.length === 0) {
    setAppStatus("Keine Kunden geladen.");
    return;
  }
  setAppStatus("Alle Daten vom Server geladen.");
}

function getClientFormData() {
  return {
    name: clientNameInput.value.trim(),
    address: clientAddressInput.value.trim(),
  };
}

async function onClientFormSubmit(event) {
  event.preventDefault();

  if (!clientForm.checkValidity()) {
    clientForm.reportValidity();
    return;
  }

  const newClient = getClientFormData();

  try {
    await api.createClient(newClient);
    clientForm.reset();
    await loadClients();
    showMessageBox("Kunde '" + newClient.name + "' wurde gespeichert!", "green");
  } catch (error) {
    showMessageBox("Fehler: " + error.message, "crimson");
  }
}

clientForm.addEventListener("submit", onClientFormSubmit);

// #endregion Kundenverwaltung

// #region Data-Management

//#endregion Data-Management

// #region App-Start

function startApp() {
  try {
    setAppStatus("Lade Projekte...");
    loadProjects();
    loadClients();
  } catch (error) {
    setAppStatus("Fehler beim Laden der Daten.");
    showMessageBox("Fehler: " + error.message, "crimson");
  }
}

startApp();

// #endregion App-Start
