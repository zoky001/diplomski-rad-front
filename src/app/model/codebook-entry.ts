import { Codebooks } from './codebooks';

export class CodebookEntry {
  id: number;
  name: string;
  type: Codebooks;

  clone(): CodebookEntry {
    let entry: CodebookEntry = new CodebookEntry();
    entry.id = this.id;
    entry.name = this.name;
    entry.type = this.type;
    return entry;
  }
}
