import {Group} from '../model/group';
import {Exposure} from '../model/exposure';
import {Client} from '../model/client';
import {Logger, LoggerFactory} from '../core-module/service/logging/LoggerFactory';
import {Collateral} from '../model/collateral';
import {ReportStatus} from '../model/report-status';

export class Utility {

  private static logger: Logger = LoggerFactory.getLogger('Utility');

  private static instanca: Utility = new Utility();

  private constructor() {

  }

  public static getInstance(): Utility {
    return Utility.instanca;
  }

  public static createGroupFromData(data: any): Group {
    const groupTemp: Group = new Group();
    Object.assign(groupTemp, data);

    const tempTotal: Exposure = new Exposure();
    Object.assign(tempTotal, groupTemp.total);
    groupTemp.total = tempTotal;

    return groupTemp;
  }

  public static createClientsArrayFromData(ulaz: Array<Client>): Array<Client> {
    const izlaz: Array<Client> = new Array<Client>();

    try {
      // code here
      for (let i = 0; i < ulaz.length; i++) {
        const temp: Client = new Client();
        Object.assign(temp, ulaz[i]);

        temp.exposures = this.createExposuresArrayFromData(temp.exposures);

        const tempTotal: Exposure = new Exposure();
        Object.assign(tempTotal, temp.total);
        temp.total = tempTotal;


        izlaz.push(temp);
      }
      return izlaz;

    } catch (e) {
      this.errorHandler('Method name: ', e);
    }
    return izlaz;

  }

  public static createExposuresArrayFromData(ulaz: Array<Exposure>): Array<Exposure> {
    const izlaz: Array<Exposure> = new Array<Exposure>();

    try {
      // code here
      for (let i = 0; i < ulaz.length; i++) {
        const temp: Exposure = new Exposure();
        Object.assign(temp, ulaz[i]);
        izlaz.push(temp);
      }
      return izlaz;

    } catch (e) {
      this.errorHandler('Method name: ', e);
    }
    return izlaz;

  }

  public static createCollateralsArrayFromData(ulaz: Array<Collateral>): Array<Collateral> {
    const izlaz: Array<Collateral> = new Array<Collateral>();

    try {
      // code here
      for (let i = 0; i < ulaz.length; i++) {
        const temp: Collateral = new Collateral();
        Object.assign(temp, ulaz[i]);
        izlaz.push(temp);
      }
      return izlaz;

    } catch (e) {
      this.errorHandler('Method name: ', e);
    }
    return izlaz;

  }

  /**
   * enum need to be sent as string
   *
   * @param enumName - enum name
   */
  public static reportStatusEnumToString(reportStatus: ReportStatus): string {
    let result: string;

    switch (reportStatus) {
      case ReportStatus.CREATING:
        result = 'CREATING';
        break;
      case ReportStatus.IN_PROGRESS:
        result = 'IN_PROGRESS';
        break;
      case ReportStatus.LOCKED:
        result = 'LOCKED';
        break;
      case ReportStatus.ERROR:
        result = 'ERROR';
        break;
      case ReportStatus.DENIED:
        result = 'DENIED';
        break;
    }

    return result;

  }


  /**
   * amount format: hrk, converted to eur, divided by 1000 or absolute
   */
  public static displayCurrencyInThousands(inHrk: number, inEur: number, currency: string, amountFormatThousand: boolean): string {
    let result = '';
    let amount = inHrk;
    if (currency !== 'HRK') {
      amount = inEur;
    }
    if (!!amount) {
      if (amountFormatThousand) {
        amount = amount / 1000;
      }
      amount = Number.parseInt((amount).toFixed(0), 10); // toFixed will round and ditch decimal digits but returns a string
      result = amount.toLocaleString(); // formatting with thousands separator
    } else {
      result = '0';
    }
    return result;
  }


  static errorHandler(error: any, message: string = 'ERROR: rispo.service => '): any {
    this.logger.info(message + ' -> ' + error);
    return error;
  }

  public displayCurrencyInThousands(inHrk: number, inEur: number, currency: string, amountFormatThousand: boolean): string {
    return Utility.displayCurrencyInThousands(inHrk, inEur, currency, amountFormatThousand);
  }


}
