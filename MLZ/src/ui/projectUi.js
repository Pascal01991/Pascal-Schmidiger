// #region Imports
import { ApiService } from "../services/ApiService.js";
import { entityMatchesSearch } from "./search.js";
import { highlightText } from "./search.js";
import { renderProjectOptionsForTimeForm } from "./time.js";
import { setAppStatus } from "./main.js";
import { showMessageBox } from "./main.js";
// #endregion Imports

// #region Globals
const api = new ApiService();
// #endregion Globals

// #region DOM References
const projectClientSelect = document.getElementById("project-client-select");
const projectForm = document.getElementById("project-form");
const projectNameInput = document.getElementById("project-name");
const projectNameError = document.getElementById("project-name-error");
const projectCompletedInput = document.getElementById("project-completed");
const projectClientIdInput = document.getElementById("project-client-select");
const projectClientError = document.getElementById("project-client-error");
const BtnCreateProject = document.getElementById("BtnCreateProject");
const BtnSaveProject = document.getElementById("BtnSaveProject");
const projectSearchInput = document.getElementById("searchProject");
const projectSearchNameField = document.getElementById("search-project-name-field");
const projectSearchClientField = document.getElementById("search-project-client-field");
const projectSearchStatusField = document.getElementById("search-project-status-field");
// #endregion DOM References

// #region State
let editMode = false;
let currentProjectId = null;
let currentProjects = [];
let currentClients = [];
let hasTriedToSubmitProjectForm = false;
// #endregion State

// #region Loading and Search
/**
 * Laedt Projekte und Kunden, speichert sie lokal und rendert danach
 * die aktuell gefilterte Projektliste neu.
 */
export async function loadProjects() {
  const projects = await api.getProjects();
  const clients = await api.getClients();
  currentProjects = projects;
  currentClients = clients;

  renderProjectOptionsForTimeForm(projects);
  renderFilteredProjectList();

  if (projects.length === 0) {
    setAppStatus("Keine Projekte geladen.");
    return;
  }
  setAppStatus("Alle Daten vom Server geladen.");
}

/**
 * Liest aus den Checkboxen aus, welche Felder aktuell durchsucht werden sollen.
 * @returns {string[]}
 */
function getSelectedProjectSearchFields() {
  const selectedFields = [];

  if (projectSearchNameField.checked) {
    selectedFields.push("name");
  }

  if (projectSearchClientField.checked) {
    selectedFields.push("clientName");
  }

  if (projectSearchStatusField.checked) {
    selectedFields.push("status");
  }

  return selectedFields;
}

function renderFilteredProjectList() {
  renderProjectList(currentProjects, currentClients);
}

/**
 * Baut die Projektliste aus den geladenen Daten neu auf.
 * Vor dem Rendern werden die Projekte anhand der aktiven Suchfelder gefiltert.
 * @param {Array<{id: number|string, name: string, clientId: number|string, completed: boolean}>} projects
 * @param {Array<{id: number|string, name: string}>} clients
 */
function renderProjectList(projects, clients) {
  const projectsList = document.getElementById("project-items");
  const clientLookup = {};
  const searchText = projectSearchInput.value;
  const selectedFields = getSelectedProjectSearchFields();

  for (const client of clients) {
    clientLookup[client.id] = client.name;
  }

  const filteredProjects = projects.filter((project) => {
    const clientName = clientLookup[project.clientId] || "Unbekannter Client";
    const statusText = project.completed ? "Abgeschlossen" : "Offen";

    return entityMatchesSearch(
      { name: project.name, clientName: clientName, status: statusText },
      searchText,
      selectedFields,
    );
  });

  if (filteredProjects.length === 0) {
    projectsList.innerHTML = "<p>Keine Projekte gefunden.</p>";
    return;
  }

  projectsList.innerHTML = filteredProjects
    .map((project) => {
      const clientName = clientLookup[project.clientId] || "Unbekannter Client";
      const statusText = project.completed ? "✅ Abgeschlossen" : "⏳ Offen";

      return `
        <div class="list-row">
          <span class="list-field">
          <div>${project.id} - ${highlightText(project.name, searchText)}</div>
          </span>
          <span class="list-field">
            <div>${project.clientId} - ${highlightText(clientName, searchText)}</div>
            <div>${highlightText(statusText, searchText)}</div>
          </span>
          <div class="list-field-actions">
            <button data-project-id="${project.id}" class="action-btn edit-project-btn" title="Bearbeiten">✏️</button>
            <button data-project-id="${project.id}" class="action-btn delete-project-btn" title="Loeschen">🗑️</button>
          </div>
        </div>
      `;
    })
    .join("");
}
// #endregion Loading and Search

// #region Form Rendering
export function renderClientOptionsForProjectForm(clients) {
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
  projectCompletedInput.checked = project.completed;
  clearProjectFormErrors();
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
  clearProjectFormErrors();
  BtnCreateProject.style.display = "block";
}

document.getElementById("BtnCloseProjectForm").addEventListener("click", hideProjectForm);
// #endregion Form Rendering

// #region Form Validation and Submit
/**
 * @returns {{ name: string, clientId: number }}
 */
function getProjectFormData() {
  return {
    name: projectNameInput.value.trim(),
    clientId: projectClientIdInput.value.trim(),
    completed: projectCompletedInput.checked,
  };
}

function validateProjectForm() {
  let isValid = true;

  clearProjectFormErrors();

  if (projectNameInput.value.trim() === "") {
    projectNameError.textContent = "Projektname ist ein Pflichtfeld.";
    projectNameInput.classList.add("input-error");
    isValid = false;
  } else if (projectNameInput.value.trim().length < 3) {
    projectNameError.textContent = "Projektname muss mindestens 3 Zeichen haben.";
    projectNameInput.classList.add("input-error");
    isValid = false;
  }

  if (projectClientIdInput.value === "") {
    projectClientError.textContent = "Ein Kunde muss ausgewaehlt sein.";
    projectClientIdInput.classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

/**
 * Fuehrt die Validierung erst nach dem ersten Submit-Versuch erneut aus.
 * So bleiben die Fehlermeldungen am Anfang ruhig und erscheinen erst bei Bedarf.
 */
function validateProjectFormIfNeeded() {
  if (!hasTriedToSubmitProjectForm) {
    return;
  }

  validateProjectForm();
}

function clearProjectFormErrors() {
  projectNameError.textContent = "";
  projectClientError.textContent = "";
  projectNameInput.classList.remove("input-error");
  projectClientIdInput.classList.remove("input-error");
  hasTriedToSubmitProjectForm = false;
}

/**
 * Verarbeitet Erstellen und Bearbeiten mit derselben Submit-Logik.
 * Der aktuelle editMode entscheidet, ob ein Projekt angelegt oder aktualisiert wird.
 *
 * @param {SubmitEvent} event
 */
async function onProjectFormSubmit(event) {
  event.preventDefault();
  hasTriedToSubmitProjectForm = true;

  if (!validateProjectForm()) {
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
// #endregion Form Validation and Submit

// #region Event Listeners
projectForm.addEventListener("submit", onProjectFormSubmit);
projectNameInput.addEventListener("input", validateProjectFormIfNeeded);
projectClientIdInput.addEventListener("change", validateProjectFormIfNeeded);
projectSearchInput.addEventListener("input", renderFilteredProjectList);
projectSearchNameField.addEventListener("change", renderFilteredProjectList);
projectSearchClientField.addEventListener("change", renderFilteredProjectList);
projectSearchStatusField.addEventListener("change", renderFilteredProjectList);

/**
 * Delegierter Klick-Handler fuer die dynamisch gerenderte Projektliste.
 * Dadurch funktionieren Bearbeiten und Loeschen auch nach jedem Neu-Rendern.
 *
 * @param {MouseEvent} event
 */
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
      console.error(error);
    }
  }
});
// #endregion Event Listeners
