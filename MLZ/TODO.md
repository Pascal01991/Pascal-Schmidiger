## Offene Aufgaben

- [x] Auto ID Vergabe bei Create Funktionen
- [ ] JSDoc Dokumentation (Lektion 4)
- [x] editProject muss erst die Daten 
- [ ] validierung mit maximallänge beschrenken

- [ ] Ergänzung Datenschema inkl. JSDoc Typen in models:    
  
    - Zeiten
      - Verrechenbar
      - Abgerechnet
      - VerrechnungsInfo
      - h
      - Datum
      - Zeit von Zeit bis (optional für Später)
      - Bemerkung
      - ProjektID
      - UserID

    - Projekt:
      - Zeiten
      - Abgeschlossen (nur wenn alle Zeiten verrechnet)
      - Fremd ID
      
    - Kunde:
      - Fremd-ID
      - Aktiv
      - Adresse
        - ...
      - 

    - User
      - ID
      - Login/Display Name
      - PW
      - Vorname Nachname
      - Rolle
    - 

    - Optional für alle:
      - Letzte änderung durch
      - Erstellt am
      - Aktualisiert am


## Offene Aufgaben Prio 2
- [ ] Models - TypeScript-Typen?
- [ ] Fehlerbehandlung siehe unten.
- [ ] BugFix CreateTestdata und DeleteDB

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