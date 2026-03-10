// Wir benötigen hier keinen Import, da JSON und jest global verfügbar sind.

describe("JSON Übung: Stringify und Parse", () => {
  // Aufgabe 1: Test mit JSON.stringify()
  test("sollte ein Objekt korrekt in einen JSON-String umwandeln", () => {
    const user = {
      firstName: "John",
      lastName: "Doe",
      age: 42,
    };

    const jsonString = JSON.stringify(user);

    // Wir prüfen, ob das Ergebnis der erwartete String ist
    // Beachte: JSON.stringify setzt doppelte Anführungszeichen!
    expect(jsonString).toBe('{"firstName":"John","lastName":"Doe","age":42}');
  });

  // Aufgabe 2: Test mit JSON.parse()
  test("sollte einen JSON-String korrekt in ein JavaScript-Objekt umwandeln", () => {
    const jsonInput = '{"color":"red","speed":50.2}';

    const resultObj = JSON.parse(jsonInput);

    // Bei Objekten nutzen wir .toEqual() statt .toBe()
    expect(resultObj).toEqual({
      color: "red",
      speed: 50.2,
    });

    // Einzelne Felder prüfen
    expect(resultObj.color).toBe("red");
  });

  // Zusatzaufgabe (Fortgeschritten aus dem Stoff): replacer
  test("sollte Strings mit einem Replacer ausfiltern", () => {
    const obj = { color: "red", speed: 50.2 };
    const isString = (v) => typeof v === "string";
    const replacer = (k, v) => (isString(v) ? undefined : v);

    const json = JSON.stringify(obj, replacer);

    // "color" ist ein String und sollte daher fehlen
    expect(json).toBe('{"speed":50.2}');
  });
});
