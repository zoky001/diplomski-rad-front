export class PlasmanTypeEntry {
  id: number;
  aplikacija: string;
  oznakaLimita: string;
  sifraNamjene: string;
  tip: string;

  clone(): PlasmanTypeEntry {
    const entry: PlasmanTypeEntry = new PlasmanTypeEntry();
    entry.id = this.id;
    entry.aplikacija = this.aplikacija;
    entry.oznakaLimita = this.oznakaLimita;
    entry.sifraNamjene = this.sifraNamjene;
    entry.tip = this.tip;
    return entry;
  }
}
