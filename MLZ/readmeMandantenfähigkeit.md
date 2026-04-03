# Mandantenfähigkeit, Login und Rollen

## Ziel

- Benutzer müssen sich anmelden.
- Die App kennt zwei Rollen:
  - `manager`
  - `timekeeper`
- Je nach Rolle sieht der Benutzer andere Bereiche der App.
- Die Lösung ist bewusst einfach gehalten für die Schulaufgabe.

WICHTIG:
Im moment nur Frontend-Schutz, nicht echter Backend-Schutz!

## Neue User-Entität

- In `db.json` gibt es neu die Collection `users`.
- Jeder User hat diese Felder:
  - `id`
  - `username`
  - `password`
  - `role`
  - `loginDisplayName`
  - `prename`
  - `lastname`
  - `externalReference`
  - `settings`

## Beispiel-User

- Es wurden zwei Start-User angelegt:
  - `manager` / `manager123`
  - `timekeeper` / `timekeeper123`

## Wichtige Dateien

- `db.json`
  - enthält die User-Daten
- `src/services/ApiService.js`
  - lädt die User vom Server mit `getUsers()`
- `src/services/AuthService.js`
  - enthält die Login- und Session-Logik
- `src/index.html`
  - enthält Login-Formular, Session-Anzeige und App-Bereich
- `src/ui/main.js`
  - startet die App, prüft Login und blendet Bereiche je nach Rolle ein oder aus

## Ablauf beim Start der App

- Die App startet in `src/ui/main.js`.
- Dort wird `startApp()` aufgerufen.
- `startApp()` ruft `authService.restoreSession()` auf.
- Dabei wird geprüft, ob im `localStorage` schon eine Session vorhanden ist.
- Falls keine Session vorhanden ist:
  - Login-Bereich wird angezeigt
  - App-Inhalt bleibt ausgeblendet
- Falls eine Session vorhanden ist:
  - User wird erneut über die API geladen
  - App-Inhalt wird angezeigt
  - Rollenrechte werden angewendet
  - Projekte und Kunden werden geladen

## Ablauf beim Login

- Der Benutzer gibt `username` und `password` im Login-Formular ein.
- Das Formular liegt in `src/index.html`.
- Beim Absenden wird in `src/ui/main.js` die Funktion `handleLoginSubmit()` ausgeführt.
- `handleLoginSubmit()` ruft `authService.login(username, password)` auf.
- `login()` macht dann Folgendes:
  - ruft `api.getUsers()` auf
  - lädt alle User vom JSON-Server
  - sucht einen User mit passendem `username` und `password`
- Wenn kein passender User gefunden wird:
  - es erscheint eine Fehlermeldung
- Wenn ein passender User gefunden wird:
  - der User wird als aktueller User gesetzt
  - die Session wird im `localStorage` gespeichert
  - die App wird geöffnet
  - Projekte und Kunden werden geladen

## Was wird vom Server geladen

- User:
  - über `ApiService.getUsers()`
  - Endpunkt: `/users`
- Projekte:
  - über `loadProjects()`
  - Endpunkt: `/projects`
- Kunden:
  - über `loadClients()`
  - Endpunkt: `/clients`

## Was wird im Browser gespeichert

- Die Session wird im `localStorage` gespeichert.
- Key:
  - `mlzCurrentUser`
- Gespeichert werden:
  - `userId`
  - `role`

## Warum wird die Session gespeichert

- Damit der Benutzer nach einem Reload nicht sofort wieder ausgeloggt ist.
- Beim nächsten Start kann die App prüfen, ob schon ein User angemeldet ist.

## Rollenlogik

- Die Rollenprüfung läuft über `AuthService.isManager()`.
- Wenn der User `manager` ist:
  - alle Bereiche sind sichtbar
- Wenn der User `timekeeper` ist:
  - Manager-Bereiche werden ausgeblendet

## Welche Bereiche nur für Manager sind

- Projektverwaltung
- Kundenverwaltung
- Daten-Management

## Wie das technisch im HTML gelöst ist

- Manager-Bereiche haben das Attribut:
  - `data-manager-only="true"`
- In `main.js` werden diese Bereiche gesammelt.
- Danach setzt `applyRoleVisibility()`, ob sie sichtbar oder versteckt sind.

## Session-Anzeige

- Nach erfolgreichem Login wird oben angezeigt, wer eingeloggt ist.
- Angezeigt wird:
  - `loginDisplayName`
  - `role`

## Logout-Ablauf

- Der Logout-Button ruft `handleLogout()` in `main.js` auf.
- Dabei passiert:
  - Session im `AuthService` wird gelöscht
  - `localStorage`-Eintrag wird entfernt
  - App-Bereich wird ausgeblendet
  - Login-Bereich wird wieder angezeigt

## Daten-Management Schutz

- Die Buttons für Datenbank löschen und Testdaten erstellen sind nur für `manager` sichtbar.
- Zusätzlich wird in `main.js` nochmals geprüft:
  - Wenn kein `manager`, dann wird die Aktion blockiert
- Das ist eine einfache doppelte Absicherung:
  - einmal in der UI
  - einmal in der Logik

## Einfachheit der Lösung

- Passwörter sind bewusst im Klartext in `db.json` gespeichert.
- Das ist für die Schulaufgabe erlaubt und einfach demonstrierbar.
- Die Struktur ist aber schon so aufgebaut, dass man später erweitern könnte:
  - sichere Passwortprüfung
  - echte Backend-Authentifizierung
  - feinere Rechte

## Kurz-Erklärung für die Präsentation

- `db.json` speichert die Benutzer.
- `ApiService` holt die User vom Server.
- `AuthService` prüft Login und verwaltet die Session.
- `main.js` steuert den Ablauf beim Start, Login und Logout.
- `index.html` enthält Login und App-Oberfläche.
- `manager` sieht alles, `timekeeper` nur die freigegebenen Bereiche.
