// #region Imports
import { ApiService } from "../services/ApiService.js";
import { entityMatchesSearch, highlightText } from "./search.js";
import { setAppStatus } from "./main.js";
import { showMessageBox } from "./main.js";
import { renderClientOptionsForProjectForm } from "./projectUI.js";
/** @typedef {import("../models/clientModel.js").client} client */
// #endregion Imports

// #region Globals
const api = new ApiService();
// #endregion Globals

// region DOM References
const clientForm = document.getElementById("client-form");
const clientNameInput = document.getElementById("client-name");
const clientNameError = document.getElementById("client-name-error");
const clientAddressInput = document.getElementById("client-address");
const clientExternalRefInput = document.getElementById("client-external-reference");
const clientActiveInput = document.getElementById("client-active");
const createClientButton = document.getElementById("BtnCreateClient");
const saveClientButton = document.getElementById("BtnSaveClient");
const closeClientFormButton = document.getElementById("BtnCloseClientForm");
const clientSearchInput = document.getElementById("searchClient");
const clientSearchNameCheckbox = document.getElementById("search-client-name-checkbox");
const clientSearchAddressCheckbox = document.getElementById("search-client-address-checkbox");
const clientSearchExternalReferenceCheckbox = document.getElementById("search-client-external-reference-checkbox");
const clientSearchActiveCheckbox = document.getElementById("search-client-active-checkbox");
const clientItemsList = document.getElementById("client-items");
// #endregion DOM References

// #region DOM References
let editMode = false;
let currentClientId = null;
let currentClients = [];
let hasTriedToSubmitClientForm = false;
// #endregion DOM References

// #region Event Listeners
clientForm.addEventListener("submit", onClientFormSubmit);
clientNameInput.addEventListener("input", validateClientFormIfNeeded);
clientAddressInput.addEventListener("input", validateClientFormIfNeeded);
clientSearchInput.addEventListener("input", renderFilteredClientList);
clientSearchNameCheckbox.addEventListener("change", renderFilteredClientList);
clientSearchAddressCheckbox.addEventListener("change", renderFilteredClientList);
clientSearchExternalReferenceCheckbox.addEventListener("change", renderFilteredClientList);
clientSearchActiveCheckbox.addEventListener("change", renderFilteredClientList);
createClientButton.addEventListener("click", () => showClientForm());
closeClientFormButton.addEventListener("click", hideClientForm);

/**
 * Delegierter Klick-Handler fuer die dynamisch gerenderte Kundenliste.
 * Dadurch funktionieren Bearbeiten und Loeschen auch nach jedem Neu-Rendern.
 *
 * @param {MouseEvent} event
 */
clientItemsList.addEventListener("click", async (event) => {
  const editButton = event.target.closest(".edit-client-btn");
  const deleteButton = event.target.closest(".delete-client-btn");

  if (editButton) {
    const clientId = editButton.getAttribute("data-client-id");
    /** @type {client} */
    const client = currentClients.find((item) => String(item.id) === clientId);

    if (client) {
      currentClientId = client.id;
      editMode = true;
      fillClientForm(client);
      showClientForm(true);
    }
  }

  if (deleteButton) {
    const clientId = deleteButton.getAttribute("data-client-id");

    try {
      await api.deleteClient(clientId);
      await loadClients();
      showMessageBox("Kunde wurde gelöscht!", "green");
    } catch (error) {
      showMessageBox("Fehler: " + error.message, "crimson");
      console.error(error);
    }
  }
});
// #endregion Event Listeners

// #region Loading and Search
/**
 * Laedt Kunden, speichert sie lokal und rendert danach
 * die aktuell gefilterte Kundenliste neu.
 */
export async function loadClients() {
  const clients = await api.getClients();
  currentClients = clients;

  renderClientOptionsForProjectForm(clients);
  renderFilteredClientList();

  if (clients.length === 0) {
    setAppStatus("Keine Kunden geladen.");
    return;
  }
  setAppStatus("Daten geladen.");
}

/**
 * Liest aus den Checkboxen aus, welche Felder aktuell durchsucht werden sollen.
 * @returns {string[]}
 */
function getSelectedClientSearchFields() {
  const selectedFields = [];

  if (clientSearchNameCheckbox.checked) {
    selectedFields.push("name");
  }

  if (clientSearchAddressCheckbox.checked) {
    selectedFields.push("address");
  }

  if (clientSearchExternalReferenceCheckbox.checked) {
    selectedFields.push("externalReference");
  }

  if (clientSearchActiveCheckbox.checked) {
    selectedFields.push("active");
  }

  return selectedFields;
}

function renderFilteredClientList() {
  renderClientList(currentClients);
}

/**
 * Baut die Kundenliste aus den geladenen Daten neu auf.
 * Vor dem Rendern werden die Kunden anhand der aktiven Suchfelder gefiltert.
 * @param {Array<{id: number|string, name: string, address: string, externalReference: string, active: boolean}>} clients
 */
function renderClientList(clients) {
  const clientsList = clientItemsList;
  const searchText = clientSearchInput.value;
  const selectedFields = getSelectedClientSearchFields();

  const filteredClients = clients.filter((client) => {
    const statusText = getClientMetaData(client);
    return entityMatchesSearch(
      {
        name: client.name,
        address: client.address,
        externalReference: client.externalReference,
        active: statusText,
      },
      searchText,
      selectedFields,
    );
  });

  if (filteredClients.length === 0) {
    clientsList.innerHTML = "<p>Keine Kunden gefunden.</p>";
    return;
  }

  clientsList.innerHTML = filteredClients
    .map((client) => {
      const statusText = getClientMetaData(client);

      return `
        <div class="list-row">
          <span class="list-field">
          <div>${client.id} - ${highlightText(client.name, searchText)}</div>
          <div>${highlightText(client.address, searchText)}</div>
          </span>
          <span class="list-field">
            <div>${highlightText(client.externalReference, searchText)}</div>
            <div>${highlightText(statusText, searchText)}</div>
          </span>
          <div class="list-field-actions">
            <button data-client-id="${client.id}" class="action-btn edit-client-btn" title="Bearbeiten">✏️</button>
            <button data-client-id="${client.id}" class="action-btn delete-client-btn" title="Loeschen">🗑️</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function getClientMetaData(client) {
  let statusText = client.active ? "✅ Aktiv" : "❌ Inaktiv";
  return statusText;
}
// #endregion Loading and Search

// #region Form Rendering

function fillClientForm(client) {
  clientNameInput.value = client.name;
  clientAddressInput.value = client.address;
  clientExternalRefInput.value = client.externalReference;
  clientActiveInput.checked = client.active;
  clearClientFormErrors();
}

function showClientForm(isEditMode = false) {
  clientForm.classList.add("is-open");
  createClientButton.style.display = "none";
  saveClientButton.textContent = isEditMode ? "Änderung speichern" : "Kunde anlegen";
}

function hideClientForm() {
  clientForm.classList.remove("is-open");
  editMode = false;
  currentClientId = null;
  clientForm.reset();
  clearClientFormErrors();
  createClientButton.style.display = "block";
}
// #endregion Form Rendering

// #region Form Validation and Submit
function getClientFormData() {
  return {
    name: clientNameInput.value.trim(),
    address: clientAddressInput.value.trim(),
    externalReference: clientExternalRefInput.value.trim(),
    active: clientActiveInput.checked,
  };
}

function validateClientForm() {
  let isValid = true;

  clearClientFormErrors();

  if (clientNameInput.value.trim() === "") {
    clientNameError.textContent = "Kundenname ist ein Pflichtfeld.";
    clientNameInput.classList.add("input-error");
    isValid = false;
  } else if (clientNameInput.value.trim().length < 3) {
    clientNameError.textContent = "Kundenname muss mindestens 3 Zeichen haben.";
    clientNameInput.classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

/**
 * Fuehrt die Validierung erst nach dem ersten Submit-Versuch erneut aus.
 * So bleiben die Fehlermeldungen am Anfang ruhig und erscheinen erst bei Bedarf.
 */
function validateClientFormIfNeeded() {
  if (!hasTriedToSubmitClientForm) {
    return;
  }

  validateClientForm();
}

function clearClientFormErrors() {
  clientNameError.textContent = "";
  clientNameInput.classList.remove("input-error");
  hasTriedToSubmitClientForm = false;
}

async function onClientFormSubmit(event) {
  event.preventDefault();
  hasTriedToSubmitClientForm = true;

  if (!validateClientForm()) {
    return;
  }

  const clientData = getClientFormData();
  const isEditMode = editMode;

  try {
    if (isEditMode) {
      await api.editClient(currentClientId, clientData);
    } else {
      await api.createClient(clientData);
    }

    const successMessage = isEditMode ? "Änderung gespeichert!" : "Kunde '" + clientData.name + "' wurde erstellt!";

    clientForm.reset();
    editMode = false;
    currentClientId = null;
    hideClientForm();
    await loadClients();
    showMessageBox(successMessage, "green");
  } catch (error) {
    showMessageBox("Fehler: " + error.message, "crimson");
  }
}
