// CommonJS:
//const sum = require("./sum");

// ES6:
import { sum } from "./sum.js";

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});

// test("array filter", () => {
//   const items = [10, 20, 30, 40, 50];
//   const restult = items.filter((i) => i > 30);
//   expect(restult).toStrictEqual([40, 50]);
// });

// test("array pop", () => {
//   const items = [10, 20, 30, 40, 50];
//   items.pop = 55;
//   items.push = 66;
//   const restult = items[4];
//   expect(restult).toEqual(50);
// });
