import { Injectable, OnDestroy } from '@angular/core';
import { RispoService } from './rispo.service';
import { CodebookEntry } from '../model/codebook-entry';
import {Logger, LoggerFactory} from '../shared/logging/LoggerFactory';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';


@Injectable()
export class CodebookService implements OnDestroy {


  constructor(private rispoService: RispoService) {

    const sub1 = this.rispoService.refreshCodebookData.subscribe(() => {

      this.loadEntries();

    });

    this.subscriptions.push(sub1);


    this.loadEntries();

  }


  public static DEFAULT_TAKER = 35;

  private logger: Logger = LoggerFactory.getLogger('CodebookService');

  public intRatings: BehaviorSubject<Map<String, CodebookEntry>> = new BehaviorSubject<Map<String, CodebookEntry>>(new Map<String, CodebookEntry>());
  public ratingModels: BehaviorSubject<Map<String, CodebookEntry>> = new BehaviorSubject<Map<String, CodebookEntry>>(new Map<String, CodebookEntry>());
  public ratingRelation: BehaviorSubject<Map<String, CodebookEntry>> = new BehaviorSubject<Map<String, CodebookEntry>>(new Map<String, CodebookEntry>());
  public plasmanType: BehaviorSubject<Map<String, CodebookEntry>> = new BehaviorSubject<Map<String, CodebookEntry>>(new Map<String, CodebookEntry>());
  public takers: BehaviorSubject<Map<String, CodebookEntry>> = new BehaviorSubject<Map<String, CodebookEntry>>(new Map<String, CodebookEntry>());
  public riskClasses: BehaviorSubject<Map<String, CodebookEntry>> = new BehaviorSubject<Map<String, CodebookEntry>>(new Map<String, CodebookEntry>());

  private subscriptions: Subscription[] = [];

  loadEntries(): void {

    const intRatings = new Map<String, CodebookEntry>();
    //  let takers = new Map<String, CodebookEntry>();
    //  let riskClasses = new Map<String, CodebookEntry>();
    //   let types = new Map<String, CodebookEntry>();
    const ratingRelations = new Map<String, CodebookEntry>();
    const ratingModels = new Map<String, CodebookEntry>();
    const plasmanType = new Map<String, CodebookEntry>();
    const takers = new Map<String, CodebookEntry>();
    const riskClasses = new Map<String, CodebookEntry>();

    //   let codebooks = new Map<number, CodebookEntry>();


    const sub = this.rispoService.getCodebookEntries().subscribe(responseData => {

      responseData.forEach(item => {

        const codeBookType: String = item.type.toString();

        switch (codeBookType) {
          case 'INT_RATING':
            intRatings.set(item.name, item);
            break;
          case 'RATING_MODEL':
            ratingModels.set(item.name, item);
            break;
          case 'RATING_RELATION':
            ratingRelations.set(item.name, item);
            break;
          case 'RISK_CLASS':
            riskClasses.set(item.name, item);
            break;
          case 'TAKER':
            takers.set(item.id + '', item);
            break;
          case 'TYPE':
            plasmanType.set(item.name, item);
            break;
          default:
            this.log('Nepostojeci tip sifrarnika: ' + codeBookType);
            break;

        }

      });

      this.intRatings.next(intRatings);
      this.ratingModels.next(ratingModels);
      this.ratingRelation.next(ratingRelations);
      this.plasmanType.next(plasmanType);
      this.takers.next(takers);
      this.riskClasses.next(riskClasses);

    }, error1 => {

      this.log('getCodebookEntries() ERROR: ' + error1);

    });

    this.subscriptions.push(sub);

  }


  getIntRatings(): Observable<Map<String, CodebookEntry>> {
    return this.intRatings;
  }

  getRatingModels(): Observable<Map<String, CodebookEntry>> {
    return this.ratingModels;
  }

  getRatingRelation(): Observable<Map<String, CodebookEntry>> {
    return this.ratingRelation;
  }

  getEntries(map: Map<String, CodebookEntry>): Array<CodebookEntry> {

    const values = Array.from(map.values());
    return values;

  }

  getPlasmanType(): Observable<Map<String, CodebookEntry>> {
    return this.plasmanType;
  }

  getTakers(): Observable<Map<String, CodebookEntry>> {
    return this.takers;
  }

  getRiskClasses(): Observable<Map<String, CodebookEntry>> {
    return this.riskClasses;
  }

  ngOnDestroy(): void {


    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.rispoService.setDafaultTitle();

  }

  log(text: string): void {

    this.logger.info('REPORTS_IN_CREATION LOGGER: ' + text);

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ERROR handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  errorHandler(error: any): void {
    this.logger.info('ERROR: rispo.service => ' + error);
  }


}
