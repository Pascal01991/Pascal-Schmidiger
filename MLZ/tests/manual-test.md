# Manuelles Testprotokoll

Dieses Protokoll dient als einfacher Nachweis für die manuelle Prüfung der wichtigsten Funktionen der App.

| Testfall                             | Schritte                                                                                                                       | Erwartetes Ergebnis                                                                     | Tatsächliches Ergebnis    | Status   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------- | -------- |
| Login mit gültigen Zugangsdaten      | 1. App starten 2. Gültigen Benutzernamen und Passwort eingeben 3. Auf `Login` klicken                                          | Die App öffnet sich und der Benutzer wird als angemeldet angezeigt                      |                           | Offen    |
| Login mit falschem Passwort          | 1. Login-Formular öffnen 2. Gültigen Benutzernamen und falsches Passwort eingeben 3. Auf `Login` klicken                       | Es erscheint eine Fehlermeldung und kein Login erfolgt                                  |                           | Offen    |
| Projekt erstellen                    | 1. Als `manager` anmelden 2. Bereich `Projekte` öffnen 3. Neues Projekt mit gültigen Werten anlegen 4. Speichern               | Das Projekt wird gespeichert und in der Projektliste angezeigt                          |                           | Offen    |
| Projektvalidierung Pflichtfeld       | 1. Als `manager` anmelden 2. Bereich `Projekte` öffnen 3. Projektformular leer oder ohne Projektname/Kunde absenden            | Das Projekt wird nicht gespeichert und eine sichtbare Fehlermeldung erscheint beim Feld |                           | Offen    |
| Projekt bearbeiten                   | 1. Als `manager` anmelden 2. In der Projektliste ein bestehendes Projekt bearbeiten 3. Wert ändern 4. Speichern                | Die Änderung wird übernommen und in der Liste angezeigt                                 |                           | Offen    |
| Kunde erstellen oder bearbeiten      | 1. Als `manager` anmelden 2. Bereich `Kunden` öffnen 3. Kunden anlegen oder bestehenden Kunden bearbeiten 4. Speichern         | Der Kunde wird neu angelegt oder korrekt aktualisiert                                   |                           | Offen    |
| Aktivität erfassen                   | 1. Anmelden 2. Datum wählen 3. Aktivität mit Projekt und Dauer anlegen 4. Speichern                                            | Die Aktivität wird gespeichert und in der Tagesliste angezeigt                          |                           | Offen    |
| Suche in einer Liste                 | 1. Projekt-, Kunden- oder Aktivitätsliste öffnen 2. Suchbegriff eingeben 3. Filter-Checkboxen bei Bedarf anpassen              | Die Liste wird passend gefiltert und Treffer werden hervorgehoben                       |                           | Offen    |
| localStorage für Theme oder Filter   | 1. Theme ändern oder Filter speichern 2. Seite neu laden                                                                       | Die gespeicherte Einstellung bleibt nach dem Reload erhalten                            |                           | Offen    |
| Rollenlogik `manager` / `timekeeper` | 1. Als `manager` anmelden und sichtbare Bereiche prüfen 2. Abmelden 3. Als `timekeeper` anmelden und sichtbare Bereiche prüfen | `manager` sieht alle Bereiche, `timekeeper` nur die freigegebenen Bereiche              |                           | Erledigt |
| Filter-Einstellungen<br>speichern    | Suchfilter verändern<br>(Checkboxen und Suchtext)                                                                              | Werden die Einstellungen (Checkboxen und Suchtext) korrekt gespeichert?                 | Wird korrekt übernommen.  | Erledigt |

## Abschluss

- Datum: 12.04.2026
- Getestet von: Pascal Schmidiger
