import { expect } from "@jest/globals";
import { ApiService } from "../src/services/ApiService.js";

describe("ApiService", () => {
  afterEach(() => {
    global.fetch = undefined;
  });

  test("getProjects liefert Projektdaten zurueck", async () => {
    const projects = [{ id: "p1", name: "Testprojekt" }];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => projects,
    });

    const api = new ApiService("http://localhost:30000");
    const result = await api.getProjects();

    expect(result).toEqual(projects);
  });

  test("createProject sendet Daten an den Server", async () => {
    const newProject = { name: "Neu", client: "c1" };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "p3", ...newProject }),
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

  test("createProject sendet keine eigene id mit", async () => {
    const newProject = { name: "Neu", client: "c1" };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "abc123", ...newProject }),
    });

    const api = new ApiService("http://localhost:3000");
    const result = await api.createProject(newProject);

    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual(newProject);
    expect(result.id).toBe("abc123");
  });

  test("createClient sendet keine eigene id mit", async () => {
    const newClient = { name: "Kunde77", address: "Bahnhofstrasse 1" };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "xyz789", ...newClient }),
    });

    const api = new ApiService("http://localhost:3000");
    const result = await api.createClient(newClient);

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newClient),
    });
    expect(result.id).toBe("xyz789");
  });
});
