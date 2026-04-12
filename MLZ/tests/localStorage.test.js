/** @jest-environment jsdom */

describe("uiPreferences localStorage", () => {
  function setupDom() {
    document.body.innerHTML = `
      <input type="checkbox" id="theme-toggle">
      <button id="save-view-button" type="button">Speichern</button>
      <input type="text" id="searchActivity" value="Aktivitaet">
      <input type="checkbox" id="search-activity-project-checkbox" checked>
      <input type="checkbox" id="search-activity-client-checkbox">
      <input type="checkbox" id="search-activity-date-checkbox" checked>
      <input type="checkbox" id="search-activity-user-checkbox">
      <input type="text" id="searchProject" value="Projekt">
      <input type="checkbox" id="search-project-name-checkbox" checked>
      <input type="checkbox" id="search-project-client-checkbox" checked>
      <input type="checkbox" id="search-project-external-reference-checkbox">
      <input type="checkbox" id="search-project-status-checkbox" checked>
      <input type="text" id="searchClient" value="Kunde">
      <input type="checkbox" id="search-client-name-checkbox" checked>
      <input type="checkbox" id="search-client-address-checkbox">
      <input type="checkbox" id="search-client-external-reference-checkbox" checked>
      <input type="checkbox" id="search-client-active-checkbox">
    `;
  }

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
  });

  test("gespeichertes Theme wird beim Initialisieren angewendet", async () => {
    setupDom();
    localStorage.setItem("theme", "dark");

    const { initUiPreferences } = await import("../src/ui/uiPreferences.js");
    initUiPreferences(jest.fn());

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.getElementById("theme-toggle").checked).toBe(true);
  });

  test("Theme-Toggle speichert den Theme-Wert", async () => {
    setupDom();

    const { initUiPreferences } = await import("../src/ui/uiPreferences.js");
    initUiPreferences(jest.fn());

    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.checked = true;
    themeToggle.dispatchEvent(new Event("change"));

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test("Filter speichern legt savedView im localStorage ab", async () => {
    setupDom();
    const showMessageBox = jest.fn();

    const { initUiPreferences } = await import("../src/ui/uiPreferences.js");
    initUiPreferences(showMessageBox);

    document.getElementById("save-view-button").click();

    const savedView = JSON.parse(localStorage.getItem("savedView"));

    expect(savedView.activitySearch).toBe("Aktivitaet");
    expect(savedView.projectSearch).toBe("Projekt");
    expect(savedView.clientSearch).toBe("Kunde");
    expect(showMessageBox).toHaveBeenCalledWith("Aktuelle Ansicht wurde gespeichert.", "green");
  });
});
