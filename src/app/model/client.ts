import { CodebookEntry } from './codebook-entry';
import { Exposure } from './exposure';

export class Client {

  private static _VRSTA_OSOBE_ZEMLJA: string = 'Z';
  private static _VRSTA_OSOBE_FIRMA: string = 'F';
  private static _VRSTA_OSOBE_OBRT: string = 'O';
  private static _VRSTA_OSOBE_GRADANIN: string = 'G';


  id: number;
  mb: string = '';
  smb: string = '';
  oib: string = '';
  jmbg: string = '';
  registerNumber: string = '';
  borrower: string = '';
  country: string = '';
  intRating: CodebookEntry;
  ratingModel: CodebookEntry;
  pd: number;
  financialsEnclosed: boolean;
  industry: string = '';
  ownerName: string = '';
  ownerShare: number;
  index: number;
  indexWithExposures: number;
  sndg: string = '';
  exposures: Exposure[] = new Array<Exposure>();
  total: Exposure = new Exposure();
  selected: boolean;
  ratingRelation: CodebookEntry;
  groupId: number;
  owner: string = '';
  grouped: boolean;
  groupedClientId: number;
  manualInput: boolean;
  includedInReport: boolean;
  primaryMember: boolean;
  orgJed: string = '';
  intRateHRK: number;
  intRateEUR: number;
  feesHRK: number;
  feesEUR: number;
  // DB response: GRESKA_DOHVATA_IZLOZENOSTI
  error: boolean;
  vrstaOsobe: string = ''; //  NT


  public provjeriVrstuOsobe(expectedValue: string): boolean {

    try {
      return expectedValue === this.vrstaOsobe;
    } catch (e) {
      throw new Error('Nemogu provjeriti vrstu osobe za brRegistra: ' + this.registerNumber);
    }

  }

  public shouldHaveExposure(): boolean {

    try {
      if (this.provjeriVrstuOsobe(Client.VRSTA_OSOBE_ZEMLJA)) {
        return false;
      }
    } catch (e) {
      throw new Error('Nemogu provjeriti vrstu osobe za brRegistra: ' + this.registerNumber);
    }

    return true;

  }


  static get VRSTA_OSOBE_ZEMLJA(): string {
    return this._VRSTA_OSOBE_ZEMLJA;
  }

  static set VRSTA_OSOBE_ZEMLJA(value: string) {
    this._VRSTA_OSOBE_ZEMLJA = value;
  }

  static get VRSTA_OSOBE_FIRMA(): string {
    return this._VRSTA_OSOBE_FIRMA;
  }

  static set VRSTA_OSOBE_FIRMA(value: string) {
    this._VRSTA_OSOBE_FIRMA = value;
  }

  static get VRSTA_OSOBE_OBRT(): string {
    return this._VRSTA_OSOBE_OBRT;
  }

  static set VRSTA_OSOBE_OBRT(value: string) {
    this._VRSTA_OSOBE_OBRT = value;
  }

  static get VRSTA_OSOBE_GRADANIN(): string {
    return this._VRSTA_OSOBE_GRADANIN;
  }

  static set VRSTA_OSOBE_GRADANIN(value: string) {
    this._VRSTA_OSOBE_GRADANIN = value;
  }


  /**
   * update if finds e othervise adds it, de
   * @param e
   * @param deleteExposure - when true deletes e from exposures list, when false replaces found exposure in list with e
   */
  updateExposure(e: Exposure, deleteExposure: boolean): void {
    let i = this.exposures.findIndex((value) => {
      return value.id === e.id;
    });
    if (deleteExposure && i === -1) {
      throw new Error('updateExposure: Cant find delete candidate in the list, id:' + e.id);
    }
    if (i > -1) {
      if (deleteExposure) {
        let part1 = this.exposures.slice(0, i);
        let part2 = this.exposures.slice(i + 1);
        this.exposures = part1.concat(part2);
      } else {
        this.exposures[i] = e;
      }

    } else {
      this.exposures.push(e);
    }
  }
}
