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

  async editClient(clientId, clientData) {
    return await this.request(`/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(clientId) {
    return await this.request(`/clients/${clientId}`, {
      method: "DELETE",
    });
  }

  // #endregion Kundenverwaltung

  // #region Benutzerverwaltung
  async getUsers() {
    return await this.request("/users");
  }

  // #endregion Benutzerverwaltung

  // #region Arbeitstage
  async getWorkdays() {
    return await this.request("/workdays");
  }

  async createWorkday(workdayData) {
    return await this.request("/workdays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workdayData),
    });
  }

  async editWorkday(workdayId, workdayData) {
    return await this.request(`/workdays/${workdayId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workdayData),
    });
  }

  async deleteWorkday(workdayId) {
    return await this.request(`/workdays/${workdayId}`, {
      method: "DELETE",
    });
  }

  // #endregion Arbeitstage

  // #region Aktivitäten
  async getActivities() {
    return await this.request("/activities");
  }

  async createActivity(activityData) {
    return await this.request("/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });
  }

  async editActivity(activityId, activityData) {
    return await this.request(`/activities/${activityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });
  }

  async deleteActivity(activityId) {
    return await this.request(`/activities/${activityId}`, {
      method: "DELETE",
    });
  }

  // #endregion Aktivitäten

  async resetDatabase() {
    const projects = await this.getProjects();
    const clients = await this.getClients();
    const workdays = await this.getWorkdays();
    const activities = await this.getActivities();

    for (const activity of activities) {
      await this.request(`/activities/${activity.id}`, { method: "DELETE" });
      await this.sleep(100);
    }

    for (const workday of workdays) {
      await this.request(`/workdays/${workday.id}`, { method: "DELETE" });
      await this.sleep(100);
    }

    for (const project of projects) {
      await this.request(`/projects/${project.id}`, { method: "DELETE" });
      await this.sleep(100);
    }

    for (const client of clients) {
      await this.request(`/clients/${client.id}`, { method: "DELETE" });
      await this.sleep(100);
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
