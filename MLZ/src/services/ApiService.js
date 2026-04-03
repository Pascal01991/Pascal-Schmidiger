export class ApiService {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  // #region Globales
  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, options);

    if (!response.ok) {
      throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // #endregion Globales

  // #region Projektverwaltung
  async getProjects() {
    return await this.request("/projects");
  }

  async createProject(projectData) {
    return this.request("/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
  }

  async editProject(projectId, projectData) {
    return this.request(`/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // #endregion

  // #region Kundenverwaltung
  async getClients() {
    return await this.request("/clients");
  }

  async createClient(clientData) {
    return await this.request("/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });
  }

  // #endregion Kundenverwaltung

  // #region Benutzerverwaltung
  async getUsers() {
    return await this.request("/users");
  }

  // #endregion Benutzerverwaltung

  // Datamanagement
  // ApiService.js

  // Füge diese Methode in die ApiService Klasse ein
  async resetDatabase() {
    const projects = await this.getProjects();
    const clients = await this.getClients();

    // Alle Projekte löschen
    for (const project of projects) {
      await this.request(`/projects/${project.id}`, { method: "DELETE" });
      await this.sleep(100);
    }

    // Alle Kunden löschen
    for (const client of clients) {
      await this.request(`/clients/${client.id}`, { method: "DELETE" });
      await this.sleep(100);
    }

    // Warten, bis alle Löschvorgänge abgeschlossen sind
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
