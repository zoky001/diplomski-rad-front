import {Injectable} from '@angular/core';
import {Collateral} from '../model/collateral';
import {Exposure} from '../model/exposure';

@Injectable()
export class ExposureGroupingService {

  constructor() {
  }


  /**
   *
   * @param parentClientId - client to which created group will belong to, the groups parent
   */
  public group(exposures: Exposure[], parentClientId: number = -1): Exposure {
    if (exposures == null || exposures.length === 0) {

      throw new Error('Nema odabranih plasmana za grupiranje');
    }

    if (exposures && exposures.length === 1) {

      throw new Error('Odabran je samo jedan plasman');

    }


    let isBrojPartijeUnique = true;
    let isBrojUgovoraUnique = true;
    let isBrojLimitaUnique = true;
    let isBrojOkviraUnique = true;
    let isIntRateUnique = true;
    let isFeesUnique = true;
    let isPlasmanTypeUnique = true;
    let isRiskClassUnique = true;
    let isSourceUnique = true;
    let isSpreadUnique = true;
    let isTakerUnique = true;
    let isTypeOfCreditUnique = true;
    let isCommitedUnique: boolean;

    let exposure: Exposure;

    if (parentClientId !== -1) { // from ex groupSelected()
      exposure = this.initializeGroupedExposure(exposures[0], parentClientId);
      exposure.clientId = parentClientId; // creating parent-child bond
      isCommitedUnique = true;
    } else {
      exposure = this.initializeGroupedExposure(exposures[0]);

    }

    let tenor: Date = null;
    let collaterals: Array<Collateral> = new Array<Collateral>();
    exposures.forEach(e => {

      exposure.add(e);

      if (isBrojPartijeUnique && !this.equals(exposure.brojPartije, e.brojPartije)) {
        isBrojPartijeUnique = false;
        exposure.brojPartije = null;
      }

      if (isBrojUgovoraUnique && !this.equals(exposure.brojUgovora, e.brojUgovora)) {
        isBrojUgovoraUnique = false;
        exposure.brojUgovora = null;
      }

      if (isBrojLimitaUnique && !this.equals(exposure.brojLimita, e.brojLimita)) {
        isBrojLimitaUnique = false;
        exposure.brojLimita = null;
      }

      if (isBrojOkviraUnique && !this.equals(exposure.brojOkvira, e.brojOkvira)) {
        isBrojOkviraUnique = false;
        exposure.brojOkvira = null;
      }

      collaterals = this.mergeCollaterals(collaterals, e.collaterals);
// 1
      if (isCommitedUnique && exposure.commited !== e.commited) {
        isCommitedUnique = false;
        exposure.commited = true;
      }

      if (isIntRateUnique && !this.equals(exposure.intRate, e.intRate)) {
        isIntRateUnique = false;
        exposure.intRate = null;
      }

      if (isFeesUnique && !this.equals(exposure.fees, e.fees)) {
        isFeesUnique = false;
        exposure.fees = 'various';
      }

      if (isPlasmanTypeUnique && exposure.plasmanType != null && e.plasmanType != null && !this.equalsNumber(exposure.plasmanType.id, e.plasmanType.id)) {
        isPlasmanTypeUnique = false;
        exposure.plasmanType = null;
      }

      if (isRiskClassUnique && exposure.riskClass != null && !this.equalsNumber(exposure.riskClass.id, e.riskClass.id)) {
        isRiskClassUnique = false;
        exposure.riskClass = null;
      }

      if (isSourceUnique && !this.equals(exposure.source, e.source)) {
        isSourceUnique = false;
        exposure.source = null;
      }

      if (isSpreadUnique && !this.equalsNumber(exposure.spread, e.spread)) {
        isSpreadUnique = false;
        exposure.spread = null;
      }

      if (isTakerUnique && exposure.taker != null && !this.equalsNumber(exposure.taker.id, e.taker.id)) {
        isTakerUnique = false;
        exposure.taker = null;
      }

      if (isTypeOfCreditUnique && !this.equals(exposure.typeOfCredit, e.typeOfCredit)) {
        isTypeOfCreditUnique = false;
        exposure.typeOfCredit = null;
      }
// 2

      if (e.tenor !== undefined && e.tenor !== null && e.tenor.length >= 10) {

        try {
          if (tenor === null) {
            tenor = e.getTenorDate();
          } else {
            const tmpTenor: Date = e.getTenorDate();

            if (tmpTenor > tenor) {
              tenor = tmpTenor;
            }

          }

        } catch (e) {

        }

      } // END IF

    }); // END FOREACH
    exposure.collaterals = collaterals;

    if (tenor) {

      exposure.tenor = tenor.getDate() + '.' + tenor.getMonth() + '.' + tenor.getFullYear();

    } else {
      exposure.tenor = this.getTodayDate();
    }

    if (parentClientId !== -1) { // from ex groupSelected()
      if (!!!exposure.typeOfCredit) {
        exposure.typeOfCredit = 'Various';
      }
    } else {
      exposure.commited = true;

    }

    return exposure;

  }

  public getTodayDate(): string {

    const date: Date = new Date();

    // let data: Data = null;

    // needs to be formatted 'dd.MM.yyyy'

    // format month in  2 digits
    let month: string;

    if (date.getMonth() + 1 < 10) {
      month = '0' + String((date.getMonth() + 1));
    } else {
      month = String((date.getMonth() + 1));
    }

    // format month in  2 digits
    let day: string;
    if (date.getDate() < 10) {
      day = '0' + String((date.getDate()));
    } else {
      day = String((date.getDate()));
    }

    // ex:     SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");

    const dateStr: string = day + '.' + month + '.' + date.getFullYear(); // + month + '-' + day + '';

    return dateStr;
  }

  private initializeGroupedExposure(exposure: Exposure, parentClientId: number = -1): Exposure {
    const grouped: Exposure = new Exposure();
    grouped.brojPartije = exposure.brojPartije;
    grouped.brojUgovora = exposure.brojUgovora;
    grouped.brojLimita = exposure.brojLimita;
    grouped.brojOkvira = exposure.brojOkvira;

    grouped.commited = exposure.commited;
    grouped.fees = exposure.fees;
    grouped.plasmanType = exposure.plasmanType;
    grouped.riskClass = exposure.riskClass;
    grouped.source = exposure.source;
    grouped.spread = exposure.spread;
    grouped.taker = exposure.taker;
    grouped.typeOfCredit = exposure.typeOfCredit;

    if (parentClientId !== -1) { // from ex groupSelected()
      grouped.interestRate = exposure.interestRate;
      grouped.tenor = exposure.tenor;
      grouped.grouped = true;

    } else {
      grouped.intRate = exposure.intRate;
      grouped.groupedClientId = exposure.groupedClientId;
    }

    return grouped;
  }


  private mergeCollaterals(c1: Array<Collateral>, c2: Array<Collateral>): Array<Collateral> {
    const m1: Map<string, Collateral> = this.toMap(c1);
    const m2: Map<string, Collateral> = this.toMap(c2);

    m2.forEach((value, key) => {

      if ((Array.from(m1.keys())).some(x => x === key)) {
        const c: Collateral = m1.get(key);
        c.add(m2.get(key));
      } else {
        m1.set(key, value);
      }
    });

    return Array.from(m1.values());
  }

  private toMap(collaterals: Array<Collateral>): Map<string, Collateral> {
    const map: Map<string, Collateral> = new Map<string, Collateral>();

    collaterals.forEach(c => {
      map.set(c.name, c);
    });

    return map;
  }


  private equals(s1: string, s2: string): boolean {
    if (s1 == null) {
      return false;
    } else {
      return s1 === s2;
    }
  }

  private equalsNumber(s1: number, s2: number): boolean {
    if (s1 == null) {
      return false;
    } else {
      return s1 === s2;
    }
  }

  // static initializeGroupedExposure(exposure: Exposure): Exposure {
  //   let grouped: Exposure = new Exposure();
  //   grouped.brojPartije = exposure.brojPartije;
  //   grouped.brojUgovora = exposure.brojUgovora;
  //   grouped.brojLimita = exposure.brojLimita;
  //   grouped.brojOkvira = exposure.brojOkvira;
  //
  //   grouped.commited = exposure.commited;
  //   grouped.interestRate = exposure.interestRate;
  //   grouped.fees = exposure.fees;
  //   grouped.plasmanType = exposure.plasmanType;
  //   grouped.riskClass = exposure.riskClass;
  //   grouped.source = exposure.source;
  //   grouped.spread = exposure.spread;
  //   grouped.taker = exposure.taker;
  //   grouped.typeOfCredit = exposure.typeOfCredit;
  //   grouped.tenor = exposure.tenor;
  //   grouped.grouped = true;
  //
  //   return grouped;
  // }


}
