import { ApiService } from "../services/ApiService.js";

// #region Globels
const api = new ApiService();
const appStatus = document.getElementById("app");

function setAppStatus(text) {
  appStatus.textContent = text;
}
// #endregion

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
// #endregion

// #region Time in Project

// #endregion
const projectSelect = document.getElementById("project-select");

// #endregion

// #region project-management
const projectClientSelect = document.getElementById("project-client-select");
const projectForm = document.getElementById("project-form");
const projectNameInput = document.getElementById("project-name");
const projectClientIdInput = document.getElementById("project-client-select");

async function loadProjects() {
  const projects = await api.getProjects();
  const clients = await api.getClients();

  renderProjectOptionsInDropDown(projects);
  renderProjectList(projects, clients);

  if (projects.length === 0) {
    setAppStatus("Keine Projekte geladen.");
    return;
  }
  setAppStatus("Alle Daten vom Server geladen.");
}

/**
 * @param {Project[]} projects
 */
function renderProjectOptionsInDropDown(projects) {
  projectSelect.innerHTML = '<option value="">-- Bitte waehlen --</option>';

  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    projectSelect.appendChild(option);
  }
}
function renderProjectList(projects, clients) {
  const projectsList = document.getElementById("project-items");
  const clientLookup = {};

  for (const client of clients) {
    clientLookup[client.id] = client.name;
  }

  projectsList.innerHTML = projects
    .map((project) => {
      const clientName = clientLookup[project.clientId] || "Unbekannter Client";

      return `
        <div class="project-card">
          <span class="project-info">${project.name}</span>
          <span class="project-info">${clientName}</span>
          <div class="project-actions">
            <button data-project-id="${project.id}" class="action-btn edit-project-btn" title="Bearbeiten">✏️</button>
            <button data-project-id="${project.id}" class="action-btn delete-project-btn" title="Loeschen">🗑️</button>
          </div>
        </div>
      `;
    })
    .join("");
}
document.getElementById("project-items").addEventListener("click", async (event) => {
  const editButton = event.target.closest(".edit-project-btn");
  const deleteButton = event.target.closest(".delete-project-btn");

  if (editButton) {
    const projectId = editButton.getAttribute("data-project-id");
    console.log("Projekt bearbeiten:", projectId);
    return;
  }

  if (deleteButton) {
    const projectId = deleteButton.getAttribute("data-project-id");

    try {
      await api.deleteProject(projectId);
      await loadProjects();
      showMessageBox("Projekt wurde gelöscht!", "green");
    } catch (error) {
      showMessageBox("Fehler: " + error.message, "crimson");
    }
  }
});

/**
 * @returns {{ name: string, clientId: number }}
 */
function getProjectFormData() {
  return {
    name: projectNameInput.value.trim(),
    clientId: projectClientIdInput.value.trim(),
  };
}

async function onProjectFormSubmit(event) {
  event.preventDefault();

  if (!projectForm.checkValidity()) {
    projectForm.reportValidity();
    return;
  }

  const newProject = getProjectFormData();

  try {
    await api.createProject(newProject);
    projectForm.reset();
    await loadProjects();
    showMessageBox("Projekt '" + newProject.name + "' wurde gespeichert!", "green");
  } catch (error) {
    showMessageBox("Fehler: " + error.message, "crimson");
  }
}

projectForm.addEventListener("submit", onProjectFormSubmit);

// #endregion

// #region Kundenverwaltung
const clientForm = document.getElementById("client-form");
const clientNameInput = document.getElementById("client-name");
const clientAddressInput = document.getElementById("client-address");

function renderClientOptions(clients) {
  projectClientSelect.innerHTML = '<option value="">-- Bitte waehlen --</option>';

  for (const client of clients) {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name;
    projectClientSelect.appendChild(option);
  }
}

async function loadClients() {
  const clients = await api.getClients();

  renderClientOptions(clients);

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

// #endregion

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
