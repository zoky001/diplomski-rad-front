import {Group} from '../model/group';
import {Exposure} from '../model/exposure';
import {Client} from '../model/client';
import {Logger, LoggerFactory} from './logging/LoggerFactory';
import {Collateral} from '../model/collateral';

export class Utility {

  private static logger: Logger = LoggerFactory.getLogger('Utility');

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


  static errorHandler(error: any, message: string = 'ERROR: rispo.service => '): any {
    this.logger.info(message + ' -> ' + error);
    return error;
  }
}
