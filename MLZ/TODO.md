## Offene Aufgaben

- [ ] Auto ID Vergabe bei Create Funktionen
- [ ] JSDoc Dokumentation (Lektion 4)

- [ ] renderProjectList


function renderProjectList(projects) {
  const projectsList = document.getElementById("projectsList");
  // HTML-Output
  projectsList.innerHTML = projects
    .map(
      (project) => `
            <div class="project-card">
                <span class="project-info">${project.name}</span>
                <span class="project-info">${project.client}</span>
                <div class="project-actions">
                    <button data-project-id="${project.id}" class="action-btn edit-project-btn" title="Bearbeiten">✏️</button>
                    <button data-project-id="${project.id}" class="action-btn delete-project-btn" title="Löschen">🗑️</button>
                </div>
            </div>
        `,
    )
    .join("");

  // Event-Listener für "Bearbeiten"
  document.querySelectorAll(".edit-project-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const projectId = btn.getAttribute("data-project-id");
      editProject(projectId);
    });
  });



[ ] JSDoc einbauen Bsp:
Zum Beispiel oben in Main.js oder in einer separaten types.js/models.js:
/**
 * @typedef {Object} Client
 * @property {number} id
 * @property {string} name
 * @property {string} address
 */

/**
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} name
 * @property {number} clientId
 */







## Offene Aufgaben Prio 2
- [ ] Models - TypeScript-Typen?
- [ ] Fehlerbehandlung siehe unten.

## Refactoring V1.0.0
- [x] ApiService.js
- [x] main.js
- [ ] index.html




Fehlerbehandlung:
https://chatgpt.com/g/g-p-69b2e4e19a2c8191bfc2048e1b739784-mlz-javascript/c/69b2f9ee-f8f8-8392-bdd1-25754339d890

Ja, du hast recht: ein Teil der Fehlerbehandlung ist schon vorhanden.
Ich präzisiere das sauberer.

1. Was ihr bereits habt – und was nicht
Vorhanden

In ApiService.request() habt ihr eine zentrale HTTP-Fehlerprüfung:

if (!response.ok) {
  throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
}

Das ist gut. Dadurch müssen getProjects(), getClients(), createProject(), createClient() nicht jeweils nochmals response.ok prüfen.

Aber das ist nicht die ganze Fehlerbehandlung

Das deckt nur den Teil ab:

HTTP-Fehlerstatus

und indirekt auch Netzwerk-/Fetch-Fehler, weil fetch() dann rejected

Was nicht automatisch gelöst ist:

wo der Fehler im UI behandelt wird

wie der Fehler dem Benutzer angezeigt wird

ob die App in einem konsistenten Status bleibt

ob parallele Ladevorgänge gemeinsam sauber behandelt werden

Darum meinte ich mit „unsauber“ nicht, dass gar keine Fehlerbehandlung existiert, sondern dass sie auf App-Ebene noch nicht durchgängig orchestriert ist.