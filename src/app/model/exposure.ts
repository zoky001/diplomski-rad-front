import { Collateral } from './collateral';
import { CodebookEntry } from './codebook-entry';
import { InterestRateReference } from './interest-rate-reference';
import { Constants } from './Constants';


export class Exposure {
  id: number;
  brojPartije: string;
  brojUgovora: string;
  brojLimita: string;
  brojOkvira: string;

  balanceHrk: number;
  balanceEur: number;
  changeHrk: number;
  changeEur: number;

  collaterals: Collateral[] = new Array<Collateral>();
  commited: boolean;
  interestRate: InterestRateReference;
  intRate: string;
  fees: string;
  lessThanYear: boolean;
  plasmanType: CodebookEntry;
  previousHrk: number;
  previousEur: number;
  proposedHrk: number;
  proposedEur: number;
  riskClass: CodebookEntry;
  securedBalanceHrk: number;
  securedBalanceEur: number;
  securedPreviousHrk: number;
  securedPreviousEur: number;
  securedProposedHrk: number;
  securedProposedEur: number;
  source: string;
  spread: number;
  taker: CodebookEntry;
  tenor: string;
  typeOfCredit: string;
  selected: boolean;
  isNew: boolean;
  clientId: number;
  owner: string;
  grouped: boolean;
  groupedExposureId: number;
  groupedClientId: number;
  tip: number;

  newChange: number;
  newBalance: number;
  newPrevious: number;
  newProposed: number;
  newSecuredBalance: number;
  newSecuredPrevious: number;
  newSecuredProposed: number;


  tenorDate: number;
  lessThanYearAsString: string;

  // logger: Logger;

  constructor() {
    // LoggerFactory.init();
    // this.logger = LoggerFactory.getLogger('Exposure');
    this.balanceHrk = 0;
    this.changeHrk = 0;
    this.previousHrk = 0;
    this.proposedHrk = 0;
    this.securedBalanceHrk = 0;
    this.securedPreviousHrk = 0;
    this.securedProposedHrk = 0;


    this.balanceEur = 0;
    this.changeEur = 0;
    this.previousEur = 0;
    this.proposedEur = 0;
    this.securedBalanceEur = 0;
    this.securedPreviousEur = 0;
    this.securedProposedEur = 0;


    this.newChange = 0;
    this.newBalance = 0;
    this.newPrevious = 0;
    this.newProposed = 0;
    this.newSecuredBalance = 0;
    this.newSecuredPrevious = 0;
    this.newSecuredProposed = 0;


    this.spread = 0;
    this.collaterals = new Array<Collateral>();
    this.tip = 99; // polje po kojem se sortira - ručni unos na kraj
    this.source = 'MI'; // manual input

  }


  public add(e: Exposure): void {
    // LoggerFactory.init();
    // this.logger = LoggerFactory.getLogger('Exposure');
    // this.logger.info(JSON.stringify(this));

    if (e.balanceHrk != null) {
      this.balanceHrk = this.balanceHrk + e.balanceHrk;
    }

    if (e.changeHrk != null) {
      this.changeHrk = this.changeHrk + e.changeHrk;
    }

    if (e.previousHrk != null) {
      this.previousHrk = this.previousHrk + e.previousHrk;
    }

    if (e.proposedHrk != null) {
      this.proposedHrk = this.proposedHrk + e.proposedHrk;
    }

    if (e.securedBalanceHrk != null) {
      this.securedBalanceHrk = this.securedBalanceHrk + e.securedBalanceHrk;
    }

    if (e.securedPreviousHrk != null) {
      this.securedPreviousHrk = this.securedPreviousHrk + e.securedPreviousHrk;
    }

    if (e.securedProposedHrk != null) {
      this.securedProposedHrk = this.securedProposedHrk + e.securedProposedHrk;
    }

    if (e.balanceEur != null) {
      this.balanceEur = this.balanceEur + e.balanceEur;
    }

    if (e.changeEur != null) {
      this.changeEur = this.changeEur + e.changeEur;
    }

    if (e.previousEur != null) {
      this.previousEur = this.previousEur + e.previousEur;
    }

    if (e.proposedEur != null) {
      this.proposedEur = this.proposedEur + e.proposedEur;
    }

    if (e.securedBalanceEur != null) {
      this.securedBalanceEur = this.securedBalanceEur + e.securedBalanceEur;
    }

    if (e.securedPreviousEur != null) {
      this.securedPreviousEur = this.securedPreviousEur + e.securedPreviousEur;
    }

    if (e.securedProposedEur != null) {
      this.securedProposedEur = this.securedProposedEur + e.securedProposedEur;
    }

    // this.logger.info(JSON.stringify(this));

  }

  // NT
  // Function will return only the date part of the tenor.
  // Problem was that some tenors have word overdue in them and I switched that check to the exposureView.xhtml
  getTenorForPrint(): string {
    // this.logger.info(JSON.stringify(this));

    if (!!this.tenor && this.tenor.length > 11) {
      // this.logger.info(JSON.stringify(this));

      return this.tenor.substring(0, 11);
    } else {
      // this.logger.info(JSON.stringify(this));

      return this.tenor;
    }
  }

  getTenorDate(): Date {
    // this.logger.info(JSON.stringify(this));

    let result: Date = new Date();
    if (!!this.tenor && this.tenor.length >= 10) {
      let dateParts = this.tenor.substring(0, 10).split('.');
      result = new Date();
      result.setMonth(Number.parseInt(dateParts[1], 10), Number.parseInt(dateParts[0], 10) - 1); // setting day and month
      result.setFullYear(Number.parseInt(dateParts[2], 10));
    }
    // this.logger.info(JSON.stringify(result));

    return result;
  }

  getCollaterals(): string {
    // this.logger.info(JSON.stringify(this));

    let result = '';
    if (!!!this.collaterals) {
      return result;
    }
    this.collaterals.forEach((value, index) => {
      result += value.name;
      if (index < this.collaterals.length - 1) {
        result += ', ';
      }
    });
    // this.logger.info(JSON.stringify(result));

    return result;
  }

  getLessThanYearAsString(): string {
    // this.logger.info(JSON.stringify(this));

    if (!!!this.tenor) {
      return '-';
    }
    if (this.lessThanYear) {
      return 'Y';
    } else {
      return 'N';
    }
  }

  isLessThanYearEmpty(): boolean {
    // this.logger.info(JSON.stringify(this));

    return this.getLessThanYearAsString() === '-';
  }

  public setNewPlacementsInHrk(): void {
    // this.logger.info(JSON.stringify(this));

    this.newBalance = this.balanceHrk;
    this.newChange = this.changeHrk;
    this.newPrevious = this.previousHrk;
    this.newProposed = this.proposedHrk;
    this.newSecuredBalance = this.securedBalanceHrk;
    this.newSecuredPrevious = this.securedPreviousHrk;
    this.newSecuredProposed = this.securedProposedHrk;

    // this.logger.info(JSON.stringify(this));

  }

  public setNewPlacementsInEur(): void {
    // this.logger.info(JSON.stringify(this));


    this.newBalance = this.balanceEur;
    this.newChange = this.changeEur;
    this.newPrevious = this.previousEur;
    this.newProposed = this.proposedEur;
    this.newSecuredBalance = this.securedBalanceEur;
    this.newSecuredPrevious = this.securedPreviousEur;
    this.newSecuredProposed = this.securedProposedEur;  // NT

    // this.logger.info(JSON.stringify(this));

  }

  isAnyPlacementChangedHrk(): boolean {
    // this.logger.info(JSON.stringify(this));

    return this.newBalance !== this.balanceHrk ||
      this.newChange !== this.changeHrk ||
      this.newPrevious !== this.previousHrk ||
      this.newProposed !== this.proposedHrk ||
      this.newSecuredBalance !== this.securedBalanceHrk ||
      this.newSecuredProposed !== this.securedProposedHrk ||
      this.newSecuredPrevious !== this.securedPreviousHrk;
  }

  isAnyPlacementChangedEur(): boolean {
    // this.logger.info(JSON.stringify(this));

    return this.newBalance !== this.balanceEur ||
      this.newChange !== this.changeEur ||
      this.newPrevious !== this.previousEur ||
      this.newProposed !== this.proposedEur ||
      this.newSecuredBalance !== this.securedBalanceEur ||
      this.newSecuredProposed !== this.securedProposedEur ||
      this.newSecuredPrevious !== this.securedPreviousEur;
  }

  isAnyPlacementChanged(currency: string): boolean {

    // this.logger.info(JSON.stringify(this));

    if (Constants.OZNAKA_HRK === currency) {
      return this.isAnyPlacementChangedHrk();
    } else if (Constants.OZNAKA_EUR === currency) {
      return this.isAnyPlacementChangedEur();
    } else {
      return false;
    }
  }

  convertIntoEur(placementHrk: number, tecaj: number): number {
    // this.logger.info(JSON.stringify(this));

    let placementEur: number = 0;

    if (!!placementHrk && placementHrk > 0 && tecaj !== null && tecaj > 0) {
      placementEur = placementHrk / tecaj;
      Number.parseFloat(placementEur.toPrecision(16));
      // this.logger.info(JSON.stringify(placementEur));
      return placementEur;
    }
    // this.logger.info(JSON.stringify(placementEur));
    return placementEur;
  }

  convertPlacementsInEur(tecaj: number): void { // NT dodana provjera za sva secured polja
    // this.logger.info(JSON.stringify(this));


    this.changeEur = this.convertIntoEur(this.newChange, tecaj);
    this.balanceEur = this.convertIntoEur(this.newBalance, tecaj);
    this.previousEur = this.convertIntoEur(this.newPrevious, tecaj);
    this.proposedEur = this.previousEur + this.changeEur; // NT proposed = previous + change

    this.securedBalanceEur = this.convertIntoEur(this.newSecuredBalance, tecaj);
    if (this.securedBalanceEur > this.balanceEur) {
      this.securedBalanceEur = this.balanceEur;
    }

    this.securedPreviousEur = this.convertIntoEur(this.newSecuredPrevious, tecaj);
    if (this.securedPreviousEur > this.previousEur) {
      this.securedPreviousEur = this.previousEur;
    }
    this.securedProposedEur = this.convertIntoEur(this.newSecuredProposed, tecaj);
    if (this.securedProposedEur > this.proposedEur) {
      this.securedProposedEur = this.proposedEur;
    }

    // this.logger.info(JSON.stringify(this));

  }

  updatePlacementsInHrk(): void { // NT dodana provjera za sva secured polja
    // this.logger.info(JSON.stringify(this));

    this.changeHrk = this.newChange;
    this.balanceHrk = this.newBalance;
    this.previousHrk = this.newPrevious;
    this.proposedHrk = this.newPrevious + this.newChange;

    this.securedBalanceHrk = this.newSecuredBalance;
    this.securedPreviousHrk = this.newSecuredPrevious;
    this.securedProposedHrk = this.newSecuredProposed;

    if (this.newSecuredBalance <= this.balanceHrk) {
      this.securedBalanceHrk = this.newSecuredBalance;
    } else {
      this.securedBalanceHrk = this.balanceHrk;
    }

    if (this.newSecuredPrevious <= this.previousHrk) {
      this.securedPreviousHrk = this.newSecuredPrevious;
    } else {
      this.securedPreviousHrk = this.previousHrk;
    }

    if (this.newSecuredProposed <= this.proposedHrk) {
      this.securedProposedHrk = this.newSecuredProposed;
    } else {
      this.securedProposedHrk = this.proposedHrk;
    }

    // this.logger.info(JSON.stringify(this));

  }

  convertIntoHrk(placementEur: number, tecaj: number): number {
    // this.logger.info(JSON.stringify(this));

    let placementHrk: number = 0;

    if (placementEur != null && placementEur > 0 && tecaj != null && tecaj > 0) {
      placementHrk = placementEur * tecaj;
      return placementHrk;
    }
    return placementHrk;
  }

  convertPlacementsInHrk(tecaj: number): void { // NT dodana provjera za sva secured polja
    // this.logger.info(JSON.stringify(this));

    this.changeHrk = this.convertIntoHrk(this.newChange, tecaj);
    this.balanceHrk = this.convertIntoHrk(this.newBalance, tecaj);
    this.previousHrk = this.convertIntoHrk(this.newPrevious, tecaj);
    this.proposedHrk = this.previousHrk + this.changeHrk; // NT

    this.securedBalanceHrk = this.convertIntoHrk(this.newSecuredBalance, tecaj);
    if (this.securedBalanceHrk > this.balanceHrk) {
      this.securedBalanceHrk = this.balanceHrk;
    }
    this.securedPreviousHrk = this.convertIntoHrk(this.newSecuredPrevious, tecaj);
    if (this.securedPreviousHrk > this.previousHrk) {
      this.securedPreviousHrk = this.previousHrk;
    }
    this.securedProposedHrk = this.convertIntoHrk(this.newSecuredProposed, tecaj);
    if (this.securedProposedHrk > this.proposedHrk) {
      this.securedProposedHrk = this.proposedHrk;
    }
  }

  updatePlacementsInEur(): void { // NT dodana provjera za sva secured polja
    // this.logger.info(JSON.stringify(this));

    this.changeEur = this.newChange;

    this.balanceEur = this.newBalance;
    this.previousEur = this.newPrevious;
    this.proposedEur = this.newPrevious + this.newChange; // NT

    if (this.newSecuredBalance <= this.balanceEur) {
      this.securedBalanceEur = this.newSecuredBalance;
    } else {
      this.securedBalanceEur = this.balanceEur;
    }

    if (this.newSecuredPrevious <= this.previousEur) {
      this.securedPreviousEur = this.newSecuredPrevious;
    } else {
      this.securedPreviousEur = this.previousEur;
    }

    if (this.newSecuredProposed <= this.proposedEur) {
      this.securedProposedEur = this.newSecuredProposed;
    } else {
      this.securedProposedEur = this.proposedEur;
    }
  }

  updateAllPlacement(tecaj: number, currency: string): void {
    // this.logger.info(JSON.stringify(this));

    if (Constants.OZNAKA_HRK === currency) {
      this.convertPlacementsInEur(tecaj);
      this.updatePlacementsInHrk();
    } else if (Constants.OZNAKA_EUR === currency) {
      this.convertPlacementsInHrk(tecaj);
      this.updatePlacementsInEur();
    } else {
      return;
    }
  }
}
