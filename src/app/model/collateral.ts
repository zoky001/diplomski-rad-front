export class Collateral {
  id: number;
  name: string;
  valueHrk: number;
  valueEur: number;
  exposureId: number;

  constructor() {
  }

  public add(c: Collateral): void {

    if (this.valueHrk !== undefined && this.valueHrk !== null && c.valueHrk !== undefined && c.valueHrk !== null) {
      this.valueHrk = this.valueHrk + c.valueHrk;
    }

    if (this.valueEur !== undefined && this.valueEur !== null && c.valueEur !== undefined && c.valueEur !== null) {
      this.valueEur = this.valueEur + c.valueEur;
    }

  }
}
