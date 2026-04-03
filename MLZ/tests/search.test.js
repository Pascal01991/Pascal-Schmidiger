import { entityMatchesSearch } from "../src/ui/search.js";
import { getSearchTerms } from "../src/ui/search.js";
import { highlightText } from "../src/ui/search.js";
import { normalizeSearchText } from "../src/ui/search.js";

describe("search helpers", () => {
  test("normalizeSearchText macht trim und lower case", () => {
    expect(normalizeSearchText("  Offen ")).toBe("offen");
  });

  test("getSearchTerms zerlegt mehrere Begriffe", () => {
    expect(getSearchTerms("  offen   meier ")).toEqual(["offen", "meier"]);
  });

  test("entityMatchesSearch findet Treffer im Projektnamen", () => {
    const matches = entityMatchesSearch(
      {
        name: "Website Relaunch",
        clientName: "Muster AG",
        status: "Offen",
      },
      "website",
      ["name"],
    );

    expect(matches).toBe(true);
  });

  test("entityMatchesSearch beachtet die gewaehlten Felder", () => {
    const matches = entityMatchesSearch(
      {
        name: "Website Relaunch",
        clientName: "Muster AG",
        status: "Offen",
      },
      "muster",
      ["name"],
    );

    expect(matches).toBe(false);
  });

  test("entityMatchesSearch nutzt UND-Logik ueber mehrere Felder", () => {
    const matches = entityMatchesSearch(
      {
        name: "Website Relaunch",
        clientName: "Meier AG",
        status: "Offen",
      },
      "offen meier",
      ["clientName", "status"],
    );

    expect(matches).toBe(true);
  });

  test("entityMatchesSearch findet nichts wenn ein Begriff fehlt", () => {
    const matches = entityMatchesSearch(
      {
        name: "Website Relaunch",
        clientName: "Meier AG",
        status: "Offen",
      },
      "offen schulz",
      ["clientName", "status"],
    );

    expect(matches).toBe(false);
  });

  test("entityMatchesSearch findet nichts wenn kein Feld ausgewaehlt ist", () => {
    const matches = entityMatchesSearch(
      {
        name: "Website Relaunch",
        clientName: "Muster AG",
        status: "Offen",
      },
      "website",
      [],
    );

    expect(matches).toBe(false);
  });

  test("highlightText markiert Treffer", () => {
    expect(highlightText("Abgeschlossen", "sch")).toBe("Abge<mark>sch</mark>lossen");
  });

  test("highlightText markiert mehrere Suchbegriffe", () => {
    expect(highlightText("Offen bei Meier", "offen meier")).toBe("<mark>Offen</mark> bei <mark>Meier</mark>");
  });
});
