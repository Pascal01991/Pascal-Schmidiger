export class Person {
  constructor(firstName, middleName, lastName, birthDate, schoolName) {
    this.firstName = firstName ?? "John";
    this.middleName = middleName;
    this.lastName = lastName ?? "Doe";
    this.birthDate = birthDate;
    this.schoolName = schoolName;
  }

  fullName() {
    //return `${this.firstName} ${this.lastName}`;
    return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(" ");
    // `${this.firstName} ${this.middleName ?? ""} ${this.lastName}`.trim();
  }

  toString() {
    return this.fullName();
  }

  age() {
    const benötigtesOderAktuellesJahr = 2024;
    return benötigtesOderAktuellesJahr - this.birthDate.getFullYear();
  }
}

export class Teacher extends Person {
  constructor(firstName, middleName, lastName, birthDate, schoolName) {
    super(firstName, middleName, lastName, birthDate, schoolName);

    if (!this.schoolName && typeof birthDate === "string") {
      this.schoolName = birthDate;
    }
    if (!this.schoolName) {
      this.schoolName = "HFU";
    }
  }
  fullName() {
    return `${super.fullName()} @ ${this.schoolName}`;
  }
}

export function getFirstAndLastLetters(test) {
  return {
    //first: test.at(1),
    first: test.at(0),
    last: test.at(-1),
  };
}

export function getReverse(test) {
  return test.split("").reverse().join("");
}

export function getCapitalized(test) {
  return test.map((t) => t.toUpperCase());
}

export function getOddCapitalized(test) {
  return test.map((t, i) => {
    return i % 2 !== 0 ? t.toUpperCase() : t.toLowerCase();
  });
}

export const getFibonacci = (n) => {
  if (!Number.isInteger(n) || n < 0) {
    return -1;
  }

  if (n === 0 || n === 1) {
    return n;
  }

  return getFibonacci(n - 1) + getFibonacci(n - 2);
};

export function* getFibonacciSequence() {
  let a = 0,
    b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

export function getCopyOfArray(a) {
  return [...a];
}

export function getJsonWithNiceFormattingAndNoNumbers(obj) {
  return JSON.stringify(obj, (k, v) => (typeof v === "number" ? undefined : v), 2);

  //   {
  //   return typeof v === 0 ? undefined : v;
  // },
  //    2,
  // );
}

export function getPropertyNames(obj) {
  return Object.keys(obj);
  // function* getKeys() {
  //   for (const objKey in obj) {
  //     yield objKey;
  //   }
  // }

  //   return getKeys();
}

export function getPropertyValues(obj) {
  // function* getValues() {
  //   for (const objKey in obj) {
  //     yield objKey;
  //   }
  // }
  return Object.values(obj);
  // return [...getValues()];
}

export function divide(numerator, denominator) {
  return denominator === 0 ? NaN : numerator / denominator;
}

export function strictDivide(numerator, denominator) {
  if (denominator === 0) {
    throw Error("Cannot divide by zero.");
  }

  return divide(numerator, denominator);
}

export function safeDivide(numerator, denominator) {
  try {
    return strictDivide(numerator, denominator);
  } catch {
    return NaN;
  }
}

export function getObjectWithAOnly(obj) {
  // const { a, rest } = obj;

  // return a;
  const { a } = obj;
  return { a };
}

export function getObjectWithAllButA(obj) {
  //  const { a, rest } = obj;
  const { a, ...rest } = obj;
  return rest;
}
