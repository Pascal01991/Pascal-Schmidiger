import "isomorphic-fetch"; // Oben in die Datei

test("call fetch gets addresses", () => {
  return fetch("http://localhost:3000/addresses")
    .then((data) => data.json())
    .then((addresses) => {
      expect(addresses.length).toBe(12);
    });
});
