import { Client } from './client';
import { Exposure } from './exposure';
import { ReportStatus } from './report-status';

export class Group {
  id: number;
  name: string;
  kpo: string;
  mb: string;
  jmbg: string;
  oib: string;
  application: string;
  status: ReportStatus;
  progress: number;
  reportDate: Date;
  owner: string;
  members: Client[];
  total: Exposure = new Exposure();
  creationDate: Date;
  currency: string;
  djelomicanDohvat: boolean;
  dohvatPoPostojecimClanicama: boolean;
  orgJed: string;
  intRateHRK: number;
  intRateEUR: number;
  creationDateAsString: string;
  reportDateAsString: string;

  feesHRK: number;
  feesEUR: number;


  locked:boolean;


  public refreshIndexes(): void {
    let index: number = 1;
    let indexWithExposures: number = 1;

    this.members.forEach(c => {
      c.index = index++;

      if ((c.exposures !== undefined && c.exposures !== null && c.exposures.length !== 0) || c.manualInput || c.error) {
        c.indexWithExposures = indexWithExposures++;
      }

    });

  }

  get isLocked(): boolean {
    return this.status === ReportStatus.LOCKED;
  }

  public updateIntRate(intRateHRK: number, intRateEUR: number): void {

    if (intRateHRK !== null) {
      this.intRateHRK = this.intRateHRK + intRateHRK;
    }

    if (intRateEUR !== null) {
      this.intRateEUR = this.intRateEUR + intRateEUR;
    }
  }

  public updateFees(feesHRK: number, feesEUR: number): void {

    if (feesHRK !== null) {
      this.feesHRK = this.feesHRK + feesHRK;
    }

    if (feesEUR !== null) {
      this.feesEUR = this.feesEUR + feesEUR;
    }

  }

  public getExposureViewForEditView(): String {

    // initialize a Dates to midnight
    let reportDateMidnight: Date = new Date(this.reportDate);
    reportDateMidnight = new Date(reportDateMidnight.setHours(0, 0, 0, 0));

    let currentDateMidnight: Date = new Date();
    currentDateMidnight = new Date(currentDateMidnight.setHours(0, 0, 0, 0));

    if (this.reportDate == null) {

      return '';

    } else if (reportDateMidnight.getTime() === currentDateMidnight.getTime()) {

      return '';

    } else if (this.dohvatPoPostojecimClanicama === true) {

      return 'Dohvat po trenutnim članicama grupe';

    } else {

      return 'Dohvat po povijesnim članicama grupe';

    }


  }

}


export enum LoadGroupDataStatus {
  LOAD_NEW_GROUP_DATA = 0, LOAD_GROUP_DATA_COMPLETED = 1
}

