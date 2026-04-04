import { ApiService } from "./ApiService.js";
/** @typedef {import("../models/userModel.js").user} user */

const SESSION_STORAGE_KEY = "mlzCurrentUser";

export class AuthService {
  constructor() {
    this.api = new ApiService();
    this.currentUser = null;
  }

  async login(username, password) {
    const users = await this.api.getUsers();
    const user = users.find((item) => item.username === username && item.password === password);

    if (!user) {
      throw new Error("Benutzername oder Passwort ist falsch.");
    }

    this.currentUser = user;

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        userId: user.id,
        role: user.role,
      }),
    );

    return user;
  }

  async restoreSession() {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!savedSession) {
      return null;
    }

    const parsedSession = JSON.parse(savedSession);
    const users = await this.api.getUsers();
    /** @type {user} */
    const user = users.find((item) => item.id === parsedSession.userId);

    if (!user) {
      this.logout();
      return null;
    }

    this.currentUser = user;
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isManager() {
    return this.currentUser?.role === "manager";
  }
}
