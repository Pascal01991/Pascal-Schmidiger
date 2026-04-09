const themeToggle = document.getElementById("theme-toggle");
const saveViewButton = document.getElementById("save-view-button");
const THEME_STORAGE_KEY = "theme";
const VIEW_STORAGE_KEY = "savedView";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.checked = theme === "dark";
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = savedTheme === "dark" ? "dark" : "light";
  applyTheme(theme);
}

function handleThemeToggleChange() {
  const theme = themeToggle.checked ? "dark" : "light";
  applyTheme(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function getViewSettings() {
  return {
    activitySearch: document.getElementById("searchActivity")?.value || "",
    activityProjectChecked: document.getElementById("search-activity-project-checkbox")?.checked || false,
    activityClientChecked: document.getElementById("search-activity-client-checkbox")?.checked || false,
    activityDateChecked: document.getElementById("search-activity-date-checkbox")?.checked || false,
    activityUserChecked: document.getElementById("search-activity-user-checkbox")?.checked || false,
    projectSearch: document.getElementById("searchProject")?.value || "",
    projectNameChecked: document.getElementById("search-project-name-checkbox")?.checked || false,
    projectClientChecked: document.getElementById("search-project-client-checkbox")?.checked || false,
    projectExternalReferenceChecked:
      document.getElementById("search-project-external-reference-checkbox")?.checked || false,
    projectStatusChecked: document.getElementById("search-project-status-checkbox")?.checked || false,
    clientSearch: document.getElementById("searchClient")?.value || "",
    clientNameChecked: document.getElementById("search-client-name-checkbox")?.checked || false,
    clientAddressChecked: document.getElementById("search-client-address-checkbox")?.checked || false,
    clientExternalReferenceChecked:
      document.getElementById("search-client-external-reference-checkbox")?.checked || false,
    clientActiveChecked: document.getElementById("search-client-active-checkbox")?.checked || false,
  };
}

function applySavedViewSettings() {
  const savedViewSettings = localStorage.getItem(VIEW_STORAGE_KEY);

  if (!savedViewSettings) {
    return;
  }

  let viewSettings = null;

  try {
    viewSettings = JSON.parse(savedViewSettings);
  } catch (error) {
    localStorage.removeItem(VIEW_STORAGE_KEY);
    return;
  }

  document.getElementById("searchActivity").value = viewSettings.activitySearch || "";
  document.getElementById("search-activity-project-checkbox").checked = viewSettings.activityProjectChecked ?? true;
  document.getElementById("search-activity-client-checkbox").checked = viewSettings.activityClientChecked ?? true;
  document.getElementById("search-activity-date-checkbox").checked = viewSettings.activityDateChecked ?? true;
  document.getElementById("search-activity-user-checkbox").checked = viewSettings.activityUserChecked ?? false;
  document.getElementById("searchProject").value = viewSettings.projectSearch || "";
  document.getElementById("search-project-name-checkbox").checked = viewSettings.projectNameChecked ?? true;
  document.getElementById("search-project-client-checkbox").checked = viewSettings.projectClientChecked ?? true;
  document.getElementById("search-project-external-reference-checkbox").checked =
    viewSettings.projectExternalReferenceChecked ?? true;
  document.getElementById("search-project-status-checkbox").checked = viewSettings.projectStatusChecked ?? true;
  document.getElementById("searchClient").value = viewSettings.clientSearch || "";
  document.getElementById("search-client-name-checkbox").checked = viewSettings.clientNameChecked ?? true;
  document.getElementById("search-client-address-checkbox").checked = viewSettings.clientAddressChecked ?? true;
  document.getElementById("search-client-external-reference-checkbox").checked =
    viewSettings.clientExternalReferenceChecked ?? true;
  document.getElementById("search-client-active-checkbox").checked = viewSettings.clientActiveChecked ?? true;
}

export function initUiPreferences(showMessageBox) {
  themeToggle.addEventListener("change", handleThemeToggleChange);
  saveViewButton.addEventListener("click", () => {
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(getViewSettings()));
    showMessageBox("Aktuelle Ansicht wurde gespeichert.", "green");
  });

  loadSavedTheme();
  applySavedViewSettings();
}
