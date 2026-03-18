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
- dokumentieren, was reingeht und rauskommt
- Typinformationen für den Editor liefern
- Autovervollständigung verbessern
- Hinweise geben

## Learnings
- `event.preventDefault()` 
	- **Verhindert das Neuladen der Seite** nach dem Klick auf onsubmit im Formular.
		- Nur dadurch bleibt die Seite offen und die Prozesse (Serveranfrage und Rückmeldung) können sauber ablaufen.