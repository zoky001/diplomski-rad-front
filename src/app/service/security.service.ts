import { Injectable } from '@angular/core';
import { RispoService } from './rispo.service';
import { User } from '../model/user';
import { Group } from '../model/group';
import { Client } from '../model/client';
import { ReportStatus } from '../model/report-status';
import {Logger, LoggerFactory} from '../shared/logging/LoggerFactory';
import {forkJoin} from 'rxjs';


@Injectable()
export class SecurityService {

  private logger: Logger = LoggerFactory.getLogger('SecurityService');
  private BROJ_ZNAMENAKA_ORGJED = 6;


  constructor(private rispoService: RispoService) {


  }


  imaPravoNaGrupu(g: Group, orgUnits: Array<string>): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {


      try {


        if (g.status === ReportStatus.IN_PROGRESS || g.status.toString() === 'IN_PROGRESS') { // provjeri u bazi
          let orgJed = '';

          orgUnits.forEach(s => {

            orgJed = orgJed + s.substring(0, s.length - 2) + ',';

          });

          if (orgJed.length !== 0) {
            orgJed = orgJed.substring(0, orgJed.length - 1);
          }

          this.rispoService.groupContainsOrganizationalUnits(g.id, orgJed).subscribe(value => {

            resolve(value);

          }, error1 => {
            reject(error1);
          });


        } else if (g.kpo === undefined || g.kpo === null) {
          //  return false; // Grupa nema KPO-clan bez grupe, provjeri clana
          resolve(false);
        } else { // arhiva - zovi servis

          this.dohvatiOrgJedGrupe(g.kpo).then(oj => {

            resolve(this.provjeriOrgJedSBrojemZnamenaka(orgUnits, oj, this.BROJ_ZNAMENAKA_ORGJED));


          }, reason => {
            reject(reason);
          });

        }


      } catch (e) {
        reject('ERROR in imaPravoNaGrupu: ' + e);
      }


      // return this.rispoService.imaPravoNaGrupu(g, orgUnits);


    });


  }

  imaPravoNaKlijenta(c: Client, user: User): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {


      try {

        if (!c.includedInReport) {
          resolve(true);
          return;
        }

        this.dohvatiOrgJedKlijenta(c.registerNumber).then(response => {

          resolve(this.provjeriOrgJedSBrojemZnamenaka(user.orgJeds, response.oj, this.BROJ_ZNAMENAKA_ORGJED));


        }, reason => {

          resolve(false);

        });

      } catch (e) {
        reject('error in imaPravoNaKlijenta: ' + e);
      }


    });


    // return this.rispoService.imaPravoNaKlijenta(c, user);

  }


  dohvatiClanoveZaKojeNemaPrava(clients: Array<string>, user: User): Promise<Array<string>> {

    const result: Array<string> = new Array<string>();

    const promiseList: Array<Promise<{ oj: string, client: string }>> = new Array<Promise<{ oj: string, client: string }>>();

    clients.forEach(c => {

      promiseList.push(this.dohvatiOrgJedKlijenta(c));

    });

    return new Promise<Array<string>>((resolve) => {

      /**
       *
       * Wait until all WS calls have been completed
       *
       */
      forkJoin(
        promiseList
      ).subscribe((response) => {

        response.forEach(value => {

          if (!this.provjeriOrgJedSBrojemZnamenaka(user.orgJeds, value.oj, this.BROJ_ZNAMENAKA_ORGJED)) {
            result.push(value.client);
          }

        });


      }, (error) => {

        result.push(error);

      }, () => {

        resolve(result);

      });


    });


  }

  private provjeriOrgJedSBrojemZnamenaka(orgJedSet: Array<string>, orgJed: string, brojZnamenaka: number): boolean {

    let tmpOrgJed: string;
    let orgJedToCheck: string;

    for (let i = 0; i < (!!orgJedSet && orgJedSet.length); i++) {
      orgJedToCheck = orgJedSet[i];

      tmpOrgJed = this.obradiOrgJedNaBrojZnamenaka(orgJedToCheck, brojZnamenaka);

      if (tmpOrgJed.toUpperCase() === orgJed.toUpperCase()) {
        return true;
      }
    }

    return false;

  }

  public dohvatiOrgJedKlijenta(brRegistra: string): Promise<{ oj: string, client: string }> {
    try {

      return new Promise<{ oj: string, client: string }>((resolve, reject) => {

        this.rispoService.podaciOKlijentu(brRegistra).subscribe(podaciOKlijentu => {

          resolve({
            oj: this.obradiOrgJedNaBrojZnamenaka(podaciOKlijentu.ojDomicil, this.BROJ_ZNAMENAKA_ORGJED),
            client: brRegistra
          });

        }, error1 => {
          reject(brRegistra);
          this.log('Greška kod dohvata klijenta sa brRegistra' + brRegistra + ' ERROR:' + error1);
          // throw new Error('Greška kod dohvata klijenta sa brRegistra' + brRegistra + ' ERROR:' + error1);
        });


      });

    } catch (e) {
      this.log('Error dohvatiOrgJedKlijenta: ERROR: ' + e);
      throw new Error('Error dohvatiOrgJedKlijenta: ERROR: ' + e);
    }

  }


  dohvatiOrgJedGrupe(kpo: string): Promise<string> {
    try {

      return new Promise<string>((resolve) => {

        this.rispoService.dohvatiGrupuPrim(kpo, '1').subscribe(g => {

          if (g.porukaGreske === undefined || g.porukaGreske == null) {

            resolve(this.obradiOrgJedNaBrojZnamenaka(g.orgJed, this.BROJ_ZNAMENAKA_ORGJED));
            return;

          }

          resolve(null);

        }, error1 => {

          throw new Error('Greska kod dohvatiOrgJedGrupe za kpo: ' + kpo + 'GREŠKA: ' + error1);

        });

      });

    } catch (e) {

      this.log('Error dohvatiOrgJedGrupe: ERROR: ' + e);
      throw new Error('Error dohvatiOrgJedGrupe: ERROR: ' + e);
    }

  }

  private obradiOrgJedNaBrojZnamenaka(orgJed: string, brojZnamenaka: number): string {

    if (orgJed === undefined || orgJed === null || orgJed === '') {
      return orgJed;
    }

    return (orgJed + '00000000').substring(0, brojZnamenaka);

  }


  log(text: any): void {
    this.logger.info('CREATE RISPO LOGGER: ' + text);
  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ERROR handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  errorHandler(error: any): void {
    this.logger.info('ERROR: rispo.service => ' + error);
  }


}
