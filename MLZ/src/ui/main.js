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

// #endregion

// #region project-management
const projectClientSelect = document.getElementById("project-client-select");
const projectForm = document.getElementById("project-form");
const projectNameInput = document.getElementById("project-name");
const projectClientIdInput = document.getElementById("project-client-select");
const BtnCreateProject = document.getElementById("BtnCreateProject");
const BtnSaveProject = document.getElementById("BtnSaveProject");
let editMode = false;
let currentProjectId = null;
let currentProjects = [];

async function loadProjects() {
  const projects = await api.getProjects();
  const clients = await api.getClients();
  currentProjects = projects;

  renderProjectOptionsForTimeForm(projects);
  renderProjectList(projects, clients);

  if (projects.length === 0) {
    setAppStatus("Keine Projekte geladen.");
    return;
  }
  setAppStatus("Alle Daten vom Server geladen.");
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

function renderClientOptionsForProjectForm(clients) {
  projectClientSelect.innerHTML = '<option value="">-- Bitte waehlen --</option>';

  for (const client of clients) {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name;
    projectClientSelect.appendChild(option);
  }
}

function fillProjectForm(project) {
  projectNameInput.value = project.name;
  projectClientIdInput.value = project.clientId;
}

function showProjectForm(isEditMode = false) {
  projectForm.style.display = "block";
  BtnCreateProject.style.display = "none";
  BtnSaveProject.textContent = isEditMode ? "Änderung speichern" : "Projekt anlegen";
}

BtnCreateProject.addEventListener("click", () => showProjectForm());

function hideProjectForm() {
  projectForm.style.display = "none";
  editMode = false;
  currentProjectId = null;
  projectForm.reset();
  BtnCreateProject.style.display = "block";
}

document.getElementById("BtnCloseProjectForm").addEventListener("click", hideProjectForm);

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

  const projectData = getProjectFormData();
  const isEditMode = editMode;

  try {
    if (isEditMode) {
      await api.editProject(currentProjectId, projectData);
    } else {
      await api.createProject(projectData);
    }

    const successMessage = isEditMode ? "Änderung gespeichert!" : "Projekt '" + projectData.name + "' wurde erstellt!";

    projectForm.reset();
    editMode = false;
    currentProjectId = null;
    hideProjectForm();
    await loadProjects();
    showMessageBox(successMessage, "green");
  } catch (error) {
    showMessageBox("Fehler: " + error.message, "crimson");
  }
}

projectForm.addEventListener("submit", onProjectFormSubmit);

document.getElementById("project-items").addEventListener("click", async (event) => {
  const editButton = event.target.closest(".edit-project-btn");
  const deleteButton = event.target.closest(".delete-project-btn");

  if (editButton) {
    const projectId = editButton.getAttribute("data-project-id");
    const project = currentProjects.find((item) => String(item.id) === projectId);

    if (project) {
      currentProjectId = project.id;
      editMode = true;
      fillProjectForm(project);
      showProjectForm(true);
    }
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

// #endregion

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

// #endregion

// #region Data-Management

//#endregion

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

// #endregion
