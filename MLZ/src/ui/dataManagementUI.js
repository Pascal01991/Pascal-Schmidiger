import { ApiService } from "../services/ApiService.js";

const deleteDatabaseButton = document.getElementById("deleteDatabase");
const createTestDataButton = document.getElementById("createTestData");
const api = new ApiService();

function setButtonsDisabled(isDisabled) {
  deleteDatabaseButton.disabled = isDisabled;
  createTestDataButton.disabled = isDisabled;
}

function lockButtonsForAMoment() {
  setButtonsDisabled(true);

  setTimeout(() => {
    setButtonsDisabled(false);
  }, 5000);
}

export function initDataManagementUI({ authService, reloadAppData, setAppStatus, showMessageBox }) {
  deleteDatabaseButton.addEventListener("click", async () => {
    if (!authService.isManager()) {
      showMessageBox("Nur Manager dürfen Daten-Management nutzen.", "crimson");
      return;
    }

    if (!confirm("Bist du sicher? Alle Projekte und Kunden werden unwiderruflich gelöscht!")) {
      return;
    }

    lockButtonsForAMoment();

    try {
      showMessageBox("Daten werden gelöscht...", "orange");
      await api.resetDatabase();
      await reloadAppData();
      showMessageBox("Datenbank wurde geleert.", "orange");
      setAppStatus("Bereit");
    } catch (error) {
      showMessageBox("Fehler beim Zurücksetzen: " + error.message, "crimson");
    }
  });

  createTestDataButton.addEventListener("click", async () => {
    if (!authService.isManager()) {
      showMessageBox("Nur Manager dürfen Testdaten erstellen.", "crimson");
      return;
    }

    try {
      setAppStatus("Erstelle Testdaten...");
      showMessageBox("Testdaten werden erstellt...", "orange");
      lockButtonsForAMoment();

      const client1 = await api.createClient({
        name: "Elektro Müller GmbH",
        address: "Musterstraße 1",
        externalReference: "",
        active: true,
      });

      const client2 = await api.createClient({
        name: "Mahler Matter AG",
        address: "Bahnhofstrasse 5, 6000 Luzern",
        externalReference: "",
        active: true,
      });

      const client3 = await api.createClient({
        name: "Intern",
        address: "",
        externalReference: "",
        active: true,
      });

      const client4 = await api.createClient({
        name: "Nokia",
        address: "Hauptstrasse 10, 8000 Zürich",
        externalReference: "",
        active: false,
      });

      const client5 = await api.createClient({
        name: "HFU",
        address: "Krämackerstrasse, 8610 Uster",
        externalReference: "",
        active: true,
      });

      const project1 = await api.createProject({
        name: "Spesen App",
        externalReference: "",
        clientId: client1.id,
        completed: false,
      });

      await api.createProject({
        name: "Zeiterfassungstool",
        externalReference: "",
        clientId: client2.id,
        completed: true,
      });

      const project3 = await api.createProject({
        name: "Webseite Unternehmenspräsentation",
        externalReference: "",
        clientId: client1.id,
        completed: false,
      });

      const project4 = await api.createProject({
        name: "Administrativer Aufwand",
        externalReference: "",
        clientId: client3.id,
        completed: false,
      });

      await api.createProject({
        name: "MLZ",
        externalReference: "",
        clientId: client5.id,
        completed: false,
      });

      const workday1 = await api.createWorkday({
        userId: 1,
        dateDay: "2026-04-15",
        totalMinutes: 180,
        sessions: [
          { id: 1, from: "08:00", to: "10:00" },
          { id: 2, from: "13:00", to: "14:00" },
        ],
      });

      await api.createActivity({
        workdayId: workday1.id,
        userId: 1,
        projectId: project1.id,
        comment: "Kickoff-Meeting mit Herr Hofstetter",
        billingInfo: "",
        durationMinutes: 60,
        billable: true,
        billed: false,
      });

      await api.createActivity({
        workdayId: workday1.id,
        userId: 1,
        projectId: project3.id,
        comment: "Konzept erstellt gemäss Email von Frau Keller",
        billingInfo: "",
        durationMinutes: 60,
        billable: true,
        billed: false,
      });

      const workday2 = await api.createWorkday({
        userId: 2,
        dateDay: "2026-04-15",
        totalMinutes: 180,
        sessions: [
          { id: 1, from: "08:00", to: "12:00" },
          { id: 2, from: "13:00", to: "17:00" },
        ],
      });

      await api.createActivity({
        workdayId: workday2.id,
        userId: 2,
        projectId: project4.id,
        comment: "Einarbeitung",
        billingInfo: "",
        durationMinutes: 480,
        billable: true,
        billed: false,
      });

      await reloadAppData();
      showMessageBox("Testdaten erfolgreich erstellt!", "green");
      setAppStatus("Bereit");
    } catch (error) {
      showMessageBox("Fehler beim Erstellen der Testdaten: " + error.message, "crimson");
      console.error(error);
    }
  });
}
