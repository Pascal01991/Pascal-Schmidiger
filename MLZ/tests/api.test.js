import { ApiService } from "../src/services/ApiService.js";

describe("ApiService", () => {
  afterEach(() => {
    global.fetch = undefined;
  });

  test("createProject sendet POST mit JSON-Body", async () => {
    const newProject = { name: "Neu", clientId: 1, completed: false };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, ...newProject }),
    });

    const api = new ApiService("http://localhost:3000");
    await api.createProject(newProject);

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
    });
  });

  test("editProject sendet PUT an die richtige URL", async () => {
    const updatedProject = { name: "Projekt X", clientId: 2, completed: true };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 5, ...updatedProject }),
    });

    const api = new ApiService("http://localhost:3000");
    await api.editProject(5, updatedProject);

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/projects/5", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProject),
    });
  });

  test("deleteProject sendet DELETE", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const api = new ApiService("http://localhost:3000");
    await api.deleteProject(7);

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/projects/7", {
      method: "DELETE",
    });
  });

  test("request wirft Fehler bei Serverfehler", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const api = new ApiService("http://localhost:3000");

    await expect(api.getProjects()).rejects.toThrow("Serverfehler: 500 Internal Server Error");
  });
});
