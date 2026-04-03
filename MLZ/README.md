### APIService.js
- Zentrale `request`-Methode. (Nach DRY-Prinzip (Don't repeat Yourself)
	- Statt in jeder Methode die auf die Datenbank zuzugreifen wurde der `fetch`-Aufruf und das Fehlerhandling zentral ausgelagert.
	  (Das wär auch eine Vorbereitung wenn man später API-Key oder Token hinzufügen will, so wäre das nur an einer Stelle zu machen.)

### package.JSON
- Vereinfachte Aufrufe:
  - Die Zeile `"server": "json-server --watch db.json --port 3000"`  vereinfacht den Server-Start im Terminal auf `npm run server`.
  - Die Zeile `"start": "http-server ./src"` vereinfacht den App-Start im Terminal auf `npm run start`

### babel.config.js
- Brücke zwischen dem was der Browser versteht, und dem, was Jest (Test-Tool) versteht.
- Jest braucht Babel um die modernen `import`-Befehle während des Testlaufs in das benötigte Format umzuwandeln.
- dank der babel.config.js können tests direkt mittels dem Befehl `npm test` gestartet werden.
- Wir konfigurieren die Datei auf ES-Module.

## JSDoc
JSDoc beschreibt Typen zusätzlich:
- dokumentieren, was reingeht und rauskommt (Übersicht / Wartbarkeit)
- Typinformationen für den Editor liefern
- Autovervollständigung verbessern
- Hinweise geben (Bsp. Refactoring wenn eine Property umbenennt wird findet die IDE alle Vorkommen zuverlässig.)

## main.js
- `main.js` ist die zentrale Steuerdatei der Benutzeroberfläche.
- Hier werden Daten geladen, ins HTML eingesetzt und Klicks oder Formularaktionen verarbeitet.

### Projektformular
- Klick auf `Edit` speichert nicht direkt, sondern lädt das gewählte Projekt zuerst ins Formular.
- Beim Submit entscheidet `editMode`, ob `createProject()` oder `editProject()` ausgeführt wird.
- `currentProjects` ist die aktuell geladene Projektliste, wir holen daraus  per `id` die Daten für die wir ans Formular übergeben. Dank `currentProjects` ist nicht eine erneute Anfrage an den server notwendig.
- `const isEditMode = editMode` ist ein kurzer Schnappschuss vom Zustand beim Klick auf Speichern.
- So bleiben API-Aufruf und Erfolgsmeldung korrekt, auch wenn `editMode` später wieder auf `false` gesetzt wird.
- `Abbrechen` hat `type="button"`, damit das Formular nicht aus Versehen abgeschickt wird.

### renderProjectList()
- `renderProjectList(projects, clients)` zeigt alle Projekte in der Liste an.
- Zuerst wird mit `clientLookup` die passende `clientId` einem Kundennamen zugeordnet.
- Danach wird mit `.map()` fuer jedes Projekt ein einfacher HTML-Block erstellt.
- Am Schluss werden alle Eintraege mit `.join("")` als Liste in `#project-items` eingesetzt.

#### Delegierter Event-Listener
- Die `edit`- und `delete`-Buttons entstehen erst später durch `renderProjectList()`.
- Darum ist ein normaler Listener direkt auf dem Button unpraktisch.
- Stattdessen hört ein Listener auf dem Container `#project-items` auf alle Klicks.
- Mit `event.target.closest()` wird geprueft, ob ein `edit`- oder `delete`-Button geklickt wurde.

##### Vorteil dieser Loesung
- Nur ein Listener statt viele einzelne.
- Funktioniert auch nach einem neuen Rendern der Liste.
- Weniger doppelter Code.
- Die Render-Funktion bleibt für die Anzeige zustaendig, der Listener fuer die Aktion.

### Validierung
- Formular-Validierung mit JavaScript umgesetzt.
- Die Prüfung läuft in einer Funktion wie `validateProjectForm()`.
- Geprüft werden Pflichtfelder und einfache Regeln, z. B. Mindestlänge beim Projektnamen und ob ein Kunde gewählt ist.
- Fehler werden direkt im DOM unter dem betroffenen Feld angezeigt.
- Ungültige Felder erhalten eine sichtbare Markierung mit CSS.

#### Benutzerfreundliche Validierung
- Die Validierung soll nicht nur technisch korrekt sein, sondern auch benutzerfreundlich.
- Darum zeigen wir Fehler erst nach dem ersten fehlerhaften Submit-Versuch an. (Überprüfung via `validateProjectFormIfNeeded`.)
- Danach wird bei jeder weiteren Eingabe direkt nachvalidiert.
- So ist das Formular am Anfang ruhig und gibt erst dann gezielt Feedback, wenn es nötig ist.

### Suchfunktion
Die Projektsuche filtert die bestehende Liste direkt im Frontend.
Gesucht wird per Freitext in den Feldern Projektname, Kundenname und Status.
Mit Checkboxen kann der Benutzer eingrenzen, welche Felder durchsucht werden.
Die Suchlogik wurde klein ausgelagert in search.js, damit sie später auch für andere Entitäten wiederverwendet werden kann.
renderProjectList() rendert danach nur noch die gefilterten Treffer.
Gefilterten Treffer werden im sofort neu geladenen DOM angezeigten und der Text mit <mark> hervorgehoben
UI/Logik - Trennung:
projectUi.js bleibt für UI und Rendern zuständig.
search.js übernimmt nur die Suchlogik. Allerdings nur kleine wiederverwendbarkeit um über-Abstraktion zu vermeiden.
Filtern mit Array-Methoden:
Mit filter() werden passende Einträge aus der Liste gewählt.

Einfache String-Suche: Mit `trim()`, `toLowerCase()` und `includes()`.
Mehrere Suchbegriffe werden per Leerzeichen getrennt und mit UND-Logik geprueft: Ein Projekt wird nur angezeigt, wenn alle Suchwoerter in den ausgewaehlten Feldern vorkommen.

#### Maskieren der Sucheingabe
- Damit die Suchfunktion mit TextHighlighting und robust funktioniert wurde die Funktion `escapeHtml()` implemntiert. Diese Maskiert die Sucheingabe so dass sie auch als Text verstanden und verarbeitet wird und nicht als HTML oder gar JavaScript Code!

## Learnings
- `event.preventDefault()` 
	- **Verhindert das Neuladen der Seite** nach dem Klick auf onsubmit im Formular.
		- Nur dadurch bleibt die Seite offen und die Prozesse (Serveranfrage und Rückmeldung) können sauber ablaufen.
