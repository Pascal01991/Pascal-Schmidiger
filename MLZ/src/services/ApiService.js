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

  // Datamanagement
  // ApiService.js

  // Füge diese Methode in die ApiService Klasse ein
  async resetDatabase() {
    const projects = await this.getProjects();
    const clients = await this.getClients();

    // Alle Projekte löschen
    const projectDeletions = projects.map((p) => this.request(`/projects/${p.id}`, { method: "DELETE" }));

    // Alle Kunden löschen
    const clientDeletions = clients.map((c) => this.request(`/clients/${c.id}`, { method: "DELETE" }));

    // Warten, bis alle Löschvorgänge abgeschlossen sind
    await Promise.all([...projectDeletions, ...clientDeletions]);
  }
}
