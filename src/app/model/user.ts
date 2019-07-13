export class User {

  username: string;

  functions: Array<string>;

  canSearch: boolean;

  canEditData: boolean;

  canEditCodebooks: boolean;

  checkSecurity: boolean;

  orgJeds: Array<string>;


  constructor(username: string, functions: Array<string>, orgJeds: Array<string>) {
    this.username = username;
    this.functions = functions;

    if (orgJeds.length < 100) {
      this.orgJeds = orgJeds;
      this.checkSecurity = true;
    }

    this.canEditData = this.functions.some(x => x === 'RISPO01');
    this.canSearch = this.functions.some(x => x === 'RISPO02') || this.canEditData;
    this.canEditCodebooks = this.functions.some(x => x === 'RISPO03');

  }
}
