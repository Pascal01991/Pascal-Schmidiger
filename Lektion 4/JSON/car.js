export class Car {
  Marke = "Volkswagen";
  Model = "Jetta";

  toJSON() {
    const { Marke, ...rest } = this;
    return rest; // without "Marke"
  }
}
