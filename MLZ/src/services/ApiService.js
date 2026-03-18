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

  // #endregion

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

  // #endregion
}
