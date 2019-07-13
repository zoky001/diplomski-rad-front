import {Injectable} from '@angular/core';
import {Group, LoadGroupDataStatus} from '../model/group';
import {Client} from '../model/client';
import {Data} from '../model/data';
import {SearchType} from '../model/SearchType';
import {ClientSearchResponse} from '../model/client-search-response';
import {ClientData} from '../model/client-data';
import {ReportStatus} from '../model/report-status';
import {TypeOfCreditEntry} from '../model/type-of-credit-entry';
import {PlasmanTypeEntry} from '../model/plasman-type-entry';
import {CodebookEntry} from '../model/codebook-entry';
import {InterestRateReference} from '../model/interest-rate-reference';
import {FindGroupCommand} from '../model/command/find-group-command';
import {GetDataRispoServiceCommand} from '../model/command/get-data-rispo-service-command';
import {FindByStatusAndDateGroupCommand} from '../model/command/find-by-status-and-date-group-command';
import {FindByOwnerAndStatusGroupCommand} from '../model/command/find-by-owner-and-status-group-command';
import {FindByStatusAndOrganizationalUnitsGroupCommand} from '../model/command/find-by-status-and-organizational-units-group-command';
import {FindByKpoWithoutClientsGroupCommand} from '../model/command/find-by-kpo-without-clients-group-command';
import {Exposure} from '../model/exposure';
import {Collateral} from '../model/collateral';
import {WsKorisnikPOSifraCommand} from '../model/command/ws-korisnik-POSifra-command';
import {WsKorisnikPOSifraData} from '../model/ws-korisnik-PO-sifra-data.';
import {PovOsWsGroup} from '../model/pov-os-ws-group';
import {KlijentPodatak} from '../model/klijent-podatak';
import {PodatciOKlijentuCommand} from '../model/command/podatci-o-klijentu-command';
import {DohvatiGrupuPrimCommand} from '../model/command/dohvati-grupu-prim-command';
import {UnGroupCommand} from '../model/command/un-group-command';
import {IdentificationCommand} from '../model/command/identification-command';
import {AzurirajIzlozenostClanaRispoServiceCommand} from '../model/command/azuriraj-izlozenost-clana-rispo-service-command';
import {FindAllGroupCommand} from '../model/command/find-all-group-command';
import {GenerateExcelReportCommand} from '../model/command/generate-excel-report-command';
import {DocumentDownloadService} from '../shared/service/document-download.service';
import {GroupCommand} from '../model/groupCommand';
import {Izlaz1} from '../model/izlaz-1';
import {RispoIzlozenostSuma} from '../model/rispo-izlozenost-suma';
import {WsKorisnikAutorizacijaCommand} from '../model/command/ws-korisnik-autorizacija-command';
import {WsKorisnikAuthorizationData} from '../model/ws-korisnik-authorization-data.';
import {PageMetaData} from '../shared/table/page-meta-data';
import {BehaviorSubject, forkJoin, Observable, Subject, throwError} from 'rxjs';
import {Logger, LoggerFactory} from '../shared/logging/LoggerFactory';
import {HttpService} from './http.service';
import {catchError, map} from 'rxjs/operators';
import {Utility} from '../shared/Utility';


@Injectable()
export class RispoService {


  constructor(private httpService: HttpService,
              /*private headerService: HeaderService,*/
              private documentDownloadService: DocumentDownloadService) {
    this.pageMetadata = new PageMetaData();
    this.pageMetadata.offset = 0;
    this.pageMetadata.limit = 10;
  }

  static readonly CALL_TRACKING_TOKEN: string = 'RispoService';
  static readonly CALL_TRACKING_TOKEN_REPORTS_IN_PROGRESS: string = 'REPORTS_IN_PROGRESS';
  static readonly CALL_TRACKING_TOKEN_LOCKED_REPORTS: string = 'LOCKED_REPORTS';
  static readonly CALL_TRACKING_TOKEN_LOGS_MODAL: string = 'LOGS_MODAL';
  static readonly CALL_TRACKING_TOKEN_TYPE_OF_CREDIT: string = 'TYPE_OF_CREDIT';
  static readonly CALL_TRACKING_TOKEN_PLACEMENT_TYPE: string = 'PLACEMENT_TYPE';
  static readonly CALL_TRACKING_TOKEN_SAVE_PLACEMENT_TYPE: string = 'SAVE_PLACEMENT_TYPE';
  static readonly CALL_TRACKING_TOKEN_CODEBOOK: string = 'CODEBOOK';
  static readonly CALL_TRACKING_TOKEN_INTEREST_RATE: string = 'INTEREST_RATE';


  static GET_DATA = 'rispo/data';
  static GET_CLIENT_DATA = 'rispo/identification';
  static RISPO_AZURIRAJ_IZLOZENOST_CLANA = 'rispo/azurirajIzlozenostClana';
  static EXCHANGE = 'rispo/tecaj';
  static RISPO_TOTAL_GROUP_EXPOSURE = 'rispo/izlozenostSuma';


  static CLIENTS_FOR_GROUP = 'client/getClientsForGroup';
  static CLIENT_SAVE = 'client/save';
  static CLIENT_UNGROUP = 'client/unGroup';
  static CLIENT_DELETE = 'client/delete';
  static CLIENT_SET_PRIMARY_MEMBER = 'client/setPrimaryMember';


  static FIND_BY_OWNER_AND_STATUS = 'group/findByOwnerAndStatus';
  static FIND_BY_STATUS_AND_DATE = 'group/findByStatusAndDate';
  static DELETE_GROUP = 'group/delete';
  static FIND_BY_STATUS_AND_ORGANIZATIONAL_UNITS = 'group/findByStatusAndOrganizationalUnits';
  static FIND_GROUP = 'group/find';
  static FIND_LOGS_BY_GROUP = 'group/findLogsByGroup';
  static GET_DISTINCT_MEMBER_FOR_GROUP = 'group/getDistinctMembersForGroup';
  static FIND_BY_KPO_WITHOUT_CLIENTS = 'group/findByKpoWithoutClients';
  static FIND_ONE = 'group/findOne';
  static GROUP_CONTAINS_ORGANIZATIONAL_UNITS = 'group/groupContainsOrganizationalUnits';
  static UPDATE_GROUP_OWNER = 'group/updateOwner';
  static LOCK_GROUP = 'group/lock';
  static FIND_ALL_GROUP = 'group/findAll';


  static FIND_BY_GROUPED_OWNER_ID = 'exposure/findByGroupedOwnerId';
  static FIND_BY_OWNER_ID = 'exposure/findByOwnerId';
  static EXPOSURE_SAVE = 'exposure/save';
  static EXPOSURE_UNGROUP_FOR_CLIENT = 'exposure/unGroup';
  static EXPOSURE_UNGROUP = 'exposure/unGroupExposure';
  static EXPOSURE_DELETE = 'exposure/delete';
  static COLLATERAL_SAVE = 'collateral/save';
  static COLLATERAL_DELETE = 'collateral/delete';

  static SOVA_POS_SIFRA = 'sova/wSKorisnikPOSifra';
  static SOVA_USER_AUTHORIZATION = 'sova/wSKorisnikAutorizacija';

  static FIND_COLLATERAL_BY_OWNER_ID = 'collateral/findByOwnerId';

  static GENERATE_EXCELL = 'report/generateExcelReport';

  static ZOK_PODATCI_O_KLIJENTU = 'zok/podaciOKlijentu';


  static POVOS_DOHVATI_GRUPU_PRIM = 'povos/dohvatiGrupuPrim';

  static GET_TYPE_OF_CREDIT_ENTRIES = 'creditType/loadTypeOfCreditData';
  static DELETE_TYPE_OF_CREDIT_ENTRY = 'creditType/delete';
  static SAVE_TYPE_OF_CREDIT_ENTRY = 'creditType/save';

  static GET_PLACEMENT_TYPE_ENTRIES = 'placementType/loadEntries';
  static SAVE_PLACEMENT_TYPE_ENTRY = 'placementType/save';
  static DELETE_PLACEMENT_TYPE_ENTRY = 'placementType/delete';

  static GET_CODEBOOK_ENTRIES = 'codebook/loadEntries';
  static DELETE_CODEBOOK_ENTRY = 'codebook/delete';
  static SAVE_CODEBOOK_ENTRY = 'codebook/save';

  static GET_INTEREST_RATE_ENTRIES = 'interestRateReference/getEntries';

  private logger: Logger = LoggerFactory.getLogger('RispoService');

  private pageMetadata: PageMetaData;


  /**
   *
   * Selected group in ReportDetails (EDIT) screen
   *
   */
  private reportDetailsGroupMembersResponse$: BehaviorSubject<Array<Client>> = new BehaviorSubject<Array<Client>>(new Array<Client>());
  public reportDetailsGroupData: BehaviorSubject<Group> = new BehaviorSubject<Group>(new Group());


  /**
   *
   * ReportsInProgressTable
   *
   */
  private reportsInProgressResponse$: BehaviorSubject<Array<Group>> = new BehaviorSubject<Array<Group>>(new Array<Group>()); // Observable<ClientData>;
  public reportsInProgressData: BehaviorSubject<Array<Group>> = new BehaviorSubject<Array<Group>>(new Array<Group>()); // Observable<ClientData>;


  /**
   * 'call' method loadGroupData() in 'ClientTableComponent'
   */
  public loadGroupData: Subject<{ id: string, status: LoadGroupDataStatus }> = new Subject<{ id: string, status: LoadGroupDataStatus }>();


  /**
   * 'call' method loadGroupData() in 'ClientTableComponent'
   */
  public fetchClient: Subject<{ searchValue: string }> = new Subject<{ searchValue: string }>();


  /**
   * 'call' method fetchByClient in 'ClientSearchFormComponent'
   */
  public fetchByClient: Subject<ClientData> = new Subject<ClientData>(); // Observable<ClientData>;

  /**
   * 'call' method fetchReportsInProcess in 'ReportsInProgressTableComponent'
   */
  public fetchReportsInProcess: Subject<void> = new Subject<void>(); // Observable<ClientData>;

  /**
   * 'call' method fetchReportsInCreation in 'ReportsInCreationTableComponent'
   */
  public fetchReportsInCreation: Subject<void> = new Subject<void>(); // Observable<ClientData>;

  /**
   * 'call' method refresh() in 'TypeOfCreditComponent'
   */
  public refreshTypeOfCreditData: Subject<void> = new Subject<void>(); // Observable<ClientData>;


  /**
   * 'call' method refresh() in 'PlacementTypeComponent'
   */
  public refreshPlacementTypeData: Subject<void> = new Subject<void>(); // Observable<ClientData>;

  /**
   * 'call' method refresh() in 'MultilanguageEntriesComponent' and LoadData() in codebook.service.ts
   */
  public refreshCodebookData: Subject<void> = new Subject<void>(); // Observable<ClientData>;

  /**
   * back service will return enums as strings
   * @param enumName - enum name
   */
  public static stringToEnum(enumName: any): any {
    let result: number;
    if (enumName === 'CREATING') {
      result = ReportStatus.CREATING;
    } else if (enumName === 'IN_PROGRESS') {
      result = ReportStatus.IN_PROGRESS;
    } else if (enumName === 'ERROR') {
      result = ReportStatus.ERROR;
    } else if (enumName === 'DENIED') {
      result = ReportStatus.DENIED;
    } else if (enumName === 'LOCKED') {
      result = ReportStatus.LOCKED;
    }
    return result;
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

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>          ReportDetails Screen Code          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  /**
   * ClientsSearchTable
   *
   *
   */
  setReportsDetailsGroup(group: Group): void {

    /*
      sort by index_with_exposure

      if (group.members !== undefined && group.members !== null && group.members.length > 0) {

          const sorted = group.members.sort((t1, t2) => {
            const name1 = t1.indexWithExposures;
            const name2 = t2.indexWithExposures;
            if (name1 > name2) { return 1; }
            if (name1 < name2) { return -1; }
            return 0;
          });

          group.members = sorted;

        }*/


    this.pageMetadata.offset = 0;

    this.reportDetailsGroupData.next(Utility.createGroupFromData(group));

    this.setNewPaginationDataClientTableData_GroupMembers(this.pageMetadata);
  }

  getReportsDetailsGroup(): Group {
    return this.reportDetailsGroupData.getValue();
  }

  getReportsDetailsGroupBS(): BehaviorSubject<Group> {
    return this.reportDetailsGroupData;
  }


  /**
   *
   * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<    ClientTable  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
   *
   *
   * Method used to create custom datasource that is needed to show data in material table
   */
  getClientTableData_GroupMembers(): Observable<Array<Client>> {

    //  return this.reportDetailsGroupMembersResponse$.map(responseData => responseData);
    return this.reportDetailsGroupMembersResponse$;

  }

  /**
   *
   *
   * ClientsSearchTable
   *
   *
   */
  setNewPaginationDataClientTableData_GroupMembers(pageMetaData: PageMetaData, showAllClients: boolean = false): void {
    // let clientData = this.clientListData.getValue();
    const start = pageMetaData.offset * pageMetaData.limit;
    const end = start + pageMetaData.limit;
    if (this.reportDetailsGroupData.getValue().members !== undefined && this.reportDetailsGroupData.getValue().members !== null) {

      //   this.reportDetailsGroupMembersResponse$.next(clientData);

      if (showAllClients) {
        // let clientData: Client[] = this.reportDetailsGroupData.getValue().members.slice(start, end);
        this.reportDetailsGroupMembersResponse$.next(this.reportDetailsGroupData.getValue().members.slice(start, end));
      } else {
        const clientDataFilter: Client[] = this.reportDetailsGroupData
          .getValue().members
          .filter(client => ((client.exposures !== null && client.exposures !== undefined && client.exposures.length !== 0) || client.manualInput || client.error));
        this.reportDetailsGroupMembersResponse$.next(clientDataFilter.slice(start, end));

      }

    }

  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>          CollateralController Code          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  findCollateralByOwnerId(id: number): Observable<Array<Collateral>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;
    /*    if (isFromModal) {
          trackingToken = RispoService.CALL_TRACKING_TOKEN_LOGS_MODAL;
        }*/


    try {
      return this.httpService.submitGetRequestAndReturnData<Array<Collateral>>({
        serviceUrl: `${RispoService.FIND_COLLATERAL_BY_OWNER_ID}?ownerId=${id}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        }), map(value => {
          return Utility.createCollateralsArrayFromData(value);
        })
      );

    } catch (e) {
      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }

  collateralSave(collateral: Collateral): Observable<any> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.COLLATERAL_SAVE}`,
        parseResponse: true,
        body: collateral,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('Error collateral save: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }
  }

  collateralDelete(collateral: Collateral): Observable<Collateral> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<Collateral>({
        serviceUrl: `${RispoService.COLLATERAL_DELETE}`,
        parseResponse: true,
        body: collateral,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('Error collateral delete: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>         SovaController Code          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  wSKorisnikAutorizacija(application: string, username: string): Observable<Array<WsKorisnikAuthorizationData>> {

    const command: WsKorisnikAutorizacijaCommand = new WsKorisnikAutorizacijaCommand();
    command.username = username;
    command.app = application;

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.SOVA_USER_AUTHORIZATION}`,
        parseResponse: false,
        body: command,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        map(response => {
          // this.logger.info('wsKOrisnikPOSifra: ' + JSON.stringify(response));
          const array: Array<WsKorisnikAuthorizationData> = response;
          return array;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {

      this.logger.info('Error wSKorisnikAutorizacija: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }

  wSKorisnikPOSifra(username: string, funkcija: string, action: string): Observable<Array<WsKorisnikPOSifraData>> {

    const command: WsKorisnikPOSifraCommand = new WsKorisnikPOSifraCommand();
    command.username = username;
    command.function = funkcija;
    command.action = action;

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.SOVA_POS_SIFRA}`,
        parseResponse: false,
        body: command,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        map(response => {
          const array: Array<WsKorisnikPOSifraData> = response;
          return array;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {

      this.logger.info('Error wSKorisnikPOSifra: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>          ExposureController Code          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  /**
   *
   */
  exposureSaveArray(entities: Array<Exposure>): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      let errorSave = false;

      try {

        const promiseList: Array<Promise<Exposure>> = new Array<Promise<Exposure>>();
        entities.forEach(entity => {

          promiseList.push(this.exposureSave(entity).toPromise());


        });

        /**
         *
         * Wait until all WS calls have been completed
         *
         */
        forkJoin(
          promiseList
        ).subscribe((response) => {
          this.logger.info('response exposureSaveArray: response: ' + response);
          // resolve(true);

        }, (error) => {
          this.logger.info('Error exposureSaveArray: ERROR: ' + error);
          errorSave = true;
          // resolve(false);
        }, () => {

          if (errorSave) {
            throw new Error('Greska kod spremanja nekih plasmana');
            // resolve(false);
          } else {
            resolve(true);
          }

        });

      } catch (e) {
        this.logger.info('Error ExposureSaveArray: ERROR: ' + e);
        throw new Error('Error ExposureSaveArray: ERROR: ' + e);
        //  resolve(false);
        // return throwError(this.errorHandler(e));

      }

    });


  }

  /**
   *
   */
  exposureSave(entity: Exposure): Observable<Exposure> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<Exposure>({
        serviceUrl: `${RispoService.EXPOSURE_SAVE}`,
        parseResponse: true,
        body: entity,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('Error exposure save: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }

  /**
   *
   */
  exposureUngroupForClient(clientId: number): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    const data: UnGroupCommand = new UnGroupCommand();
    data.clientId = clientId;

    try {

      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.EXPOSURE_UNGROUP_FOR_CLIENT}`,
        parseResponse: false,
        body: data,
        additionalHeaders: new Headers({
          'x-call-tracking-token': trackingToken
        })
      }).pipe(
        map(response => {
          return response.data;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {

      this.logger.info('exposureUngroupForClient' + e);
      return throwError(this.errorHandler(e));
    }

  }

  ungroupExposure(exposure: Exposure, clientId: number): Observable<boolean> {


    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    const data: UnGroupCommand = new UnGroupCommand();
    data.clientId = clientId;
    data.exposure = exposure;

    try {

      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.EXPOSURE_UNGROUP}`,
        parseResponse: false,
        body: data,
        additionalHeaders: new Headers({
          'x-call-tracking-token': trackingToken
        })
      }).pipe(
        map(response => {
          return response.data;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('exposureUngroup' + e);
      return throwError(this.errorHandler(e));
    }

  }

  exposureDelete(exposure: Exposure): Observable<Exposure> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<Exposure>({
        serviceUrl: `${RispoService.EXPOSURE_DELETE}`,
        parseResponse: true,
        body: exposure,
        additionalHeaders: new Headers({
          'x-call-tracking-token': trackingToken
        })
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('exposureDelete' + e);
      return throwError(this.errorHandler(e));
    }

  }

  findByGroupedOwnerId(id: number): Observable<Array<Exposure>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;
    /*    if (isFromModal) {
          trackingToken = RispoService.CALL_TRACKING_TOKEN_LOGS_MODAL;
        }*/


    try {
      return this.httpService.submitGetRequestAndReturnData<Array<Exposure>>({
        serviceUrl: `${RispoService.FIND_BY_GROUPED_OWNER_ID}?ownerId=${id}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        }), map(value => {
          return Utility.createExposuresArrayFromData(value);
        })
      );

    } catch (e) {
      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }

  findByOwnerId(id: number): Observable<Array<Exposure>> {
    const trackingToken = RispoService.CALL_TRACKING_TOKEN;
    /*    if (isFromModal) {
          trackingToken = RispoService.CALL_TRACKING_TOKEN_LOGS_MODAL;
        }*/


    try {
      return this.httpService.submitGetRequestAndReturnData<Array<Exposure>>({
        serviceUrl: `${RispoService.FIND_BY_OWNER_ID}?ownerId=${id}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        }), map(value => {
          return Utility.createExposuresArrayFromData(value);
        })
      );

    } catch (e) {
      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>           Report Controller          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  /**
   *
   */
  populateWorkbook(group: Group, date: Date, exportCurrency: string, name: string): Observable<boolean> {


    const generateExcelReportCommand: GenerateExcelReportCommand = new GenerateExcelReportCommand();
    generateExcelReportCommand.group = new GroupCommand(group);
    generateExcelReportCommand.date = date.getTime();
    generateExcelReportCommand.exportCurrency = exportCurrency;

    //   this.logger.info(JSON.stringify(generateExcelReportCommand));


    try {

      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.GENERATE_EXCELL}`,
        parseResponse: true,
        body: generateExcelReportCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': RispoService.CALL_TRACKING_TOKEN})
      }).pipe(
        map(data => {
          // Excel generated.
          this.documentDownloadService.downloadFileInExcelFormat(data, name);
          return true;
        }), catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );


    } catch (e) {
      this.logger.info('Error populateWorkbook: ERROR: ' + e);
      return throwError(this.errorHandler(e, 'Greska kod kreiranja Excell izvještaja!'));

    }

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>           Group Controller          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  /**
   *
   */
  findAll(searchType: number, searchCriteria: string): Observable<Array<Group>> {


    const findAllGroupCommand: FindAllGroupCommand = new FindAllGroupCommand();
    findAllGroupCommand.searchType = searchType;
    findAllGroupCommand.searchCriteria = searchCriteria;


    try {
      return this.httpService.submitRequestAndReturnData<Array<Group>>({
        serviceUrl: `${RispoService.FIND_ALL_GROUP}`,
        parseResponse: true,
        body: findAllGroupCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': RispoService.CALL_TRACKING_TOKEN})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e, e.toString()));
        })
      );

    } catch (e) {
      this.logger.info('Error findAll: ERROR: ' + e);
      return throwError(this.errorHandler(e, 'Greska kod dohvata svih grupa za kriterij: ' + searchCriteria));

    }

  }


  /**
   *
   */
  lockGroup(group: Group): Observable<Data> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    const groupCommand: Group = new Group();
    groupCommand.id = group.id;


    try {

      return this.httpService.submitRequestAndReturnData<Data>({
        serviceUrl: `${RispoService.LOCK_GROUP}`,
        parseResponse: true,
        body: groupCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e, 'Greska kod zakljucavanja grupe sa IDjem  ' + group.id));
        })
      );

    } catch (e) {
      return throwError(this.errorHandler(e, 'Greska kod zakljucavanja grupe sa IDjem  ' + group.id));
    }


  }


  updateGroupOwner(groupId: number, owner: string): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {
      return this.httpService.submitGetRequestAndReturnData<boolean>({
        serviceUrl: `${RispoService.UPDATE_GROUP_OWNER}?groupId=${groupId}&owner=${owner}`,
        parseResponse: false,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        map(response => {
          return true;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('Error updateGroupOwner: ERROR: ' + e);
      return throwError(this.errorHandler(e, 'Greska kod azuriranja vlasnika grupe ' + groupId));

    }

  }


  groupContainsOrganizationalUnits(id: number, organizationalUnits: string): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {
      return this.httpService.submitGetRequestAndReturnData<boolean>({
        serviceUrl: `${RispoService.GROUP_CONTAINS_ORGANIZATIONAL_UNITS}?id=${id}&organizationalUnits=${organizationalUnits}`,
        parseResponse: false,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        map(response => {
          const res: boolean = response;
          return res;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('Error groupContainsOrganizationalUnits: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }


  findLogsByGroup(groupId: number, isFromModal: boolean = false): Observable<Array<string>> {

    // let trackingToken = RispoService.CALL_TRACKING_TOKEN;
    let trackingToken = '';

    if (isFromModal) {
      trackingToken = RispoService.CALL_TRACKING_TOKEN_LOGS_MODAL;
    }


    try {
      return this.httpService.submitGetRequestAndReturnData<Array<string>>({
        serviceUrl: `${RispoService.FIND_LOGS_BY_GROUP}?groupId=${groupId}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {
      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }

  findByKpoWithoutClients(searchQuery: String, members: Array<String>): Observable<Array<Group>> {

    const findGroupCommand: FindByKpoWithoutClientsGroupCommand = new FindByKpoWithoutClientsGroupCommand();

    findGroupCommand.kpo = searchQuery;

    findGroupCommand.clanovi = members;


    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    try {
      return this.httpService.submitRequestAndReturnData<Array<Group>>({
        serviceUrl: `${RispoService.FIND_BY_KPO_WITHOUT_CLIENTS}`,
        parseResponse: true,
        body: findGroupCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {
      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }


  findGroup(searchType: number, searchQuery: String, status: number): Observable<Array<Group>> {

    const findGroupCommand: FindGroupCommand = new FindGroupCommand();

    findGroupCommand.searchType = searchType;
    findGroupCommand.searchQuery = searchQuery;
    findGroupCommand.status = status;


    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    try {
      return this.httpService.submitRequestAndReturnData<Array<Group>>({
        serviceUrl: `${RispoService.FIND_GROUP}`,
        parseResponse: true,
        body: findGroupCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }


  /**
   *
   */
  findByStatusAndOrganizationalUnits(status: number, date: Date, organizationalUnits: Array<string>): Observable<Array<Group>> {

    // let data: Data = null;

    // needs to be formatted 'yyyy-MM-dd'

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

    const dateStr: string = date.getFullYear() + '-' + month + '-' + day + '';

    let trackingToken = RispoService.CALL_TRACKING_TOKEN;
    if (status === ReportStatus.IN_PROGRESS.valueOf()) {
      trackingToken = RispoService.CALL_TRACKING_TOKEN_REPORTS_IN_PROGRESS;
    }

    const findByStatusAndOrganizationalUnitsGroupCommand: FindByStatusAndOrganizationalUnitsGroupCommand = new FindByStatusAndOrganizationalUnitsGroupCommand();
    findByStatusAndOrganizationalUnitsGroupCommand.status = status;
    findByStatusAndOrganizationalUnitsGroupCommand.date = dateStr;
    findByStatusAndOrganizationalUnitsGroupCommand.organizationalUnits = organizationalUnits;

    try {
      return this.httpService.submitRequestAndReturnData<Array<Group>>({
        serviceUrl: `${RispoService.FIND_BY_STATUS_AND_ORGANIZATIONAL_UNITS}`,
        parseResponse: true,
        body: findByStatusAndOrganizationalUnitsGroupCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }


  deleteGroup(group: Group): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    const groupNew: Group = new Group();
    groupNew.id = group.id;

    try {
      return this.httpService.submitRequestAndReturnData<boolean>({
        serviceUrl: `${RispoService.DELETE_GROUP}`,
        parseResponse: true,
        body: groupNew,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));
    }

    // let userId = this.userDataService.getUserData().principal.workerInfo.brRadnikaKadode;
  }


  /**
   *
   */
  findByStatusAndDate(status: number, date: Date): Observable<Array<Group>> {

    const findByStatusAndDateGroupCommand: FindByStatusAndDateGroupCommand = new FindByStatusAndDateGroupCommand();
    findByStatusAndDateGroupCommand.status = status;
    findByStatusAndDateGroupCommand.date = date.getTime();


    let trackingToken = RispoService.CALL_TRACKING_TOKEN;
    if (status === ReportStatus.IN_PROGRESS.valueOf()) {
      trackingToken = RispoService.CALL_TRACKING_TOKEN_REPORTS_IN_PROGRESS;
    }


    try {
      return this.httpService.submitRequestAndReturnData<Array<Group>>({
        serviceUrl: `${RispoService.FIND_BY_STATUS_AND_DATE}`,
        parseResponse: true,
        body: findByStatusAndDateGroupCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }

  findOne(id: string): Observable<Group> {


    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    try {
      return this.httpService.submitGetRequestAndReturnData<Group>({
        serviceUrl: `${RispoService.FIND_ONE}?id=${id}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        }),
        map(data => {
          data.reportDate = new Date(data.reportDate); // fix DateTime to Date
          data.creationDate = new Date(data.creationDate); // fix DateTime to Date
          data.status = RispoService.stringToEnum(data.status); // enum name to enum

          /*      const groupTemp: Group = new Group();
                Object.assign(groupTemp, data);

                const tempTotal: Exposure = new Exposure();
                Object.assign(tempTotal, groupTemp.total);
                groupTemp.total = tempTotal;
                */

          return Utility.createGroupFromData(data);
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }

  /**
   *
   */
  findByOwnerAndStatus(brRadnika: String, status: ReportStatus): Observable<Array<Group>> {

    let trackingToken = RispoService.CALL_TRACKING_TOKEN;

    if (status === ReportStatus.IN_PROGRESS) {
      trackingToken = RispoService.CALL_TRACKING_TOKEN_REPORTS_IN_PROGRESS;
    } else if (status === ReportStatus.CREATING) {
      trackingToken = '';
    }

    const findByOwnerAndStatusGroupCommand: FindByOwnerAndStatusGroupCommand = new FindByOwnerAndStatusGroupCommand();
    findByOwnerAndStatusGroupCommand.brRadnika = brRadnika;
    findByOwnerAndStatusGroupCommand.status = status;

    try {
      return this.httpService.submitRequestAndReturnData<Array<Group>>({
        serviceUrl: `${RispoService.FIND_BY_OWNER_AND_STATUS}`,
        parseResponse: true,
        body: findByOwnerAndStatusGroupCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }

  /**
   *
   */
  getDistinctMembersForGroup(kpo: string): Observable<Array<string>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    return this.httpService.submitGetRequestAndReturnData<Array<string>>({
      serviceUrl: `${RispoService.GET_DISTINCT_MEMBER_FOR_GROUP}?kpo=${kpo}`,
      parseResponse: true,
      additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>          zok Controller          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  podaciOKlijentu(idKlijenta: string): Observable<KlijentPodatak> {

    const podatciOKlijentuCommand: PodatciOKlijentuCommand = new PodatciOKlijentuCommand();

    podatciOKlijentuCommand.brRegistra = idKlijenta;

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    try {
      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.ZOK_PODATCI_O_KLIJENTU}`,
        parseResponse: false,
        body: podatciOKlijentuCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})

      }).pipe(
        map(response => {

          const klijentPodatak: KlijentPodatak = response;
          return klijentPodatak;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>          povOsobeService Controller          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  dohvatiGrupuPrim(identifikator: string, grupaFlg: string): Observable<PovOsWsGroup> {

    const dohvatiGrupuPrimCommand: DohvatiGrupuPrimCommand = new DohvatiGrupuPrimCommand();

    dohvatiGrupuPrimCommand.kpo = identifikator;
    dohvatiGrupuPrimCommand.flag = grupaFlg;

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    try {
      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.POVOS_DOHVATI_GRUPU_PRIM}`,
        parseResponse: false,
        body: dohvatiGrupuPrimCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})

      }).pipe(
        map(response => {

          const povOs: PovOsWsGroup = response;
          return povOs;
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>           Client controller         <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  /**
   *
   */
  clientDelete(client: Client): Observable<Client> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<Client>({
        serviceUrl: `${RispoService.CLIENT_DELETE}`,
        parseResponse: true,
        body: client,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e, 'Greska kod brisanja klijenata sa IDjem ' + client.id));
        })
      );

    } catch (e) {
      return throwError(this.errorHandler(e, 'Greska kod brisanja klijenata sa IDjem ' + client.id));
    }


  }

  /**
   *
   */
  clientSetPrimaryMember(client: Client): Observable<Client> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<Client>({
        serviceUrl: `${RispoService.CLIENT_SET_PRIMARY_MEMBER}`,
        parseResponse: true,
        body: client,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e, 'Greska kod postavljanja matice za klijenta sa IDjem ' + client.id));
        })
      );
    } catch (e) {
      return throwError(this.errorHandler(e, 'Greska kod postavljanja matice za klijenta sa IDjem ' + client.id));
    }


  }

  /**
   *
   */
  clientUngroup(client: Client): Observable<Array<Client>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<Array<Client>>({
        serviceUrl: `${RispoService.CLIENT_UNGROUP}`,
        parseResponse: true,
        body: client,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        }),
        map(value => {
          return Utility.createClientsArrayFromData(value);
        })
      );

    } catch (e) {

      this.logger.info('clientUngroup' + e);
      return throwError(this.errorHandler(e));

    }


  }


  /**
   *
   */
  clientsForGroup(groupId: number): Observable<Array<Client>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {
      return this.httpService.submitGetRequestAndReturnData<Array<Client>>({
        serviceUrl: `${RispoService.CLIENTS_FOR_GROUP}?ownerId=${groupId}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        }),
        map(value => {
          return Utility.createClientsArrayFromData(value);
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }


  /**
   *
   */
  clientSaveArray(entities: Array<Client>): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      let errorSave = false;

      try {

        const promiseList: Array<Promise<Client>> = new Array<Promise<Client>>();
        entities.forEach(entity => {

          promiseList.push(this.clientSave(entity).toPromise());


        });

        /**
         *
         * Wait until all WS calls have been completed
         *
         */
        forkJoin(
          promiseList
        ).subscribe((response) => {
          // this.logger.info('response clientSaveArray: response: ' + response);
          // resolve(true);

        }, (error) => {
          this.logger.info('Error clientSaveArray: ERROR: ' + error);
          errorSave = true;
          // resolve(false);
        }, () => {

          if (errorSave) {
            throw new Error('Greska kod spremanja klijenata');
            // resolve(false);
          } else {
            resolve(true);
          }

        });

      } catch (e) {

        this.logger.info('Error clientSaveArray: ERROR: ' + e);
        throw new Error('Error clientSaveArray: ERROR: ' + e);
        //  resolve(false);
        // return throwError(this.errorHandler(e));

      }

    });


  }

  /**
   *
   */
  clientSave(client: Client): Observable<Client> {
    // this.logger.info('CLIENT- SAVE: ' + JSON.stringify(client));

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {

      return this.httpService.submitRequestAndReturnData<Client>({
        serviceUrl: `${RispoService.CLIENT_SAVE}`,
        parseResponse: true,
        body: client,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      })/*.map(response => {
        this.logger.info('CLIENT- SAVE: ' + JSON.stringify(response));
        return true;
      })*/.pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );

    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>           Rispo controller                <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  /**
   *
   */
  azurirajIzlozenostClana(groupId: number, clientRegNumber: string, userName: string): Observable<Data> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    const azurirajIzlozenostClanaRispoServiceCommand: AzurirajIzlozenostClanaRispoServiceCommand = new AzurirajIzlozenostClanaRispoServiceCommand();
    azurirajIzlozenostClanaRispoServiceCommand.id = groupId.toString();
    azurirajIzlozenostClanaRispoServiceCommand.registerNumber = clientRegNumber;
    azurirajIzlozenostClanaRispoServiceCommand.userName = userName;

    try {

      return this.httpService.submitRequestAndReturnData<Data>({
        serviceUrl: `${RispoService.RISPO_AZURIRAJ_IZLOZENOST_CLANA}`,
        parseResponse: true,
        body: azurirajIzlozenostClanaRispoServiceCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e, 'Azuriranje podataka clana", "Greska tijekom azuriranja podataka clana'));
        })
      );

    } catch (e) {
      return throwError(this.errorHandler(e, 'Azuriranje podataka clana", "Greska tijekom azuriranja podataka clana'));

    }


  }


  /**
   *
   */
  getData(criteria: String, criteriaType: number, oznDevize: String, datum: string, brRadnika: string, dohvatPoPostojecimClanicama: boolean): Observable<Data> {

    const getDataRispoServiceCommand: GetDataRispoServiceCommand = new GetDataRispoServiceCommand();

    getDataRispoServiceCommand.criteria = criteria;
    getDataRispoServiceCommand.criteriaType = criteriaType;
    getDataRispoServiceCommand.oznDevize = oznDevize;
    getDataRispoServiceCommand.datum = datum;
    getDataRispoServiceCommand.brRadnika = brRadnika;
    getDataRispoServiceCommand.dohvatPoPostojecimClanicama = dohvatPoPostojecimClanicama;


    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    try {
      return this.httpService.submitRequestAndReturnData<Data>({
        serviceUrl: `${RispoService.GET_DATA}`,
        parseResponse: true,
        body: getDataRispoServiceCommand,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ', e);
      return throwError(this.errorHandler(e));

    }

  }

  totalGroupExposure(groupId: string, currency: string): Observable<RispoIzlozenostSuma> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;


    try {
      return this.httpService.submitGetRequestAndReturnData<RispoIzlozenostSuma>({
        serviceUrl: `${RispoService.RISPO_TOTAL_GROUP_EXPOSURE}?groupId=${groupId}&currency=${currency}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})

      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error totalGroupExposure: ERROR: ', e);
      return throwError(this.errorHandler(e));

    }

  }

  /**
   * {"datum": "2018-09-11","jezik": "","oznBurze": "001","oznDevize": "EUR","vrstaKlijenta": ""}
   *
   */
  getExchangeList(stockId: string, currencyId: string, date: Date, clientTypeId: string, language: string): Observable<Izlaz1> {
    let strDate = '';
    if (!!date) {
      strDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }
    const trackingToken = RispoService.CALL_TRACKING_TOKEN;
    try {
      return this.httpService.submitRequestAndReturnData<any>({
        serviceUrl: `${RispoService.EXCHANGE}`,
        parseResponse: true, // todo true doesen't work
        body: {'datum': strDate, 'jezik': language, 'oznBurze': stockId, 'oznDevize': currencyId, 'vrstaKlijenta': clientTypeId},
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})

      }).pipe(
        map(value => {
          if (!!value && !!value.tecajnaLista) {
            value.tecajnaLista.datum = !!value.tecajnaLista.datum ? new Date(value.tecajnaLista.datum) : '';
            value.tecajnaLista.datumDo = !!value.tecajnaLista.datumDo ? new Date(value.tecajnaLista.datumDo) : '';
            value.tecajnaLista.datumKreiranja = !!value.tecajnaLista.datumKreiranja ? new Date(value.tecajnaLista.datumKreiranja) : '';
            return value;
          }
        }),
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error getExchangeList: ERROR: ', e);
      return throwError(this.errorHandler(e));

    }

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>          RestClient                          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  getClientData(type: SearchType, data: String): Observable<ClientSearchResponse> {

    const identificationCommand: IdentificationCommand = new IdentificationCommand();

    identificationCommand.data = data.toString();
    identificationCommand.type = type.typeNumber;

    return this.httpService.submitRequestAndReturnData<ClientSearchResponse>({
      serviceUrl: `${RispoService.GET_CLIENT_DATA}`,
      parseResponse: true,
      body: identificationCommand,
      additionalHeaders: new Headers({'x-call-tracking-token': RispoService.CALL_TRACKING_TOKEN})

    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>         TypeOfCreditService           <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  /**
   *
   */
  getTypeOfCreditEntries(): Observable<Array<TypeOfCreditEntry>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN_TYPE_OF_CREDIT;

    try {
      return this.httpService.submitGetRequestAndReturnData<Array<TypeOfCreditEntry>>({
        serviceUrl: `${RispoService.GET_TYPE_OF_CREDIT_ENTRIES}`,
        parseResponse: true,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error getTypeOfCreditEntries(): ERROR: ' + e);
      return throwError(this.errorHandler(e));
    }

  }

  deleteTypeOfCreditEntry(data: TypeOfCreditEntry): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN_TYPE_OF_CREDIT;

    try {
      return this.httpService.submitRequestAndReturnData<boolean>({
        serviceUrl: `${RispoService.DELETE_TYPE_OF_CREDIT_ENTRY}`,
        parseResponse: true,
        body: data,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error saveTypeOfCreditEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));
    }
  }


  saveTypeOfCreditEntry(data: TypeOfCreditEntry): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    try {
      return this.httpService.submitRequestAndReturnData<boolean>({
        serviceUrl: `${RispoService.SAVE_TYPE_OF_CREDIT_ENTRY}`,
        parseResponse: true,
        body: data,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error saveTypeOfCreditEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }

  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>         PlacementService           <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  /**
   *
   */
  getPlacementTypeEntries(): Observable<Array<PlasmanTypeEntry>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN_PLACEMENT_TYPE;

    return this.httpService.submitGetRequestAndReturnData<Array<PlasmanTypeEntry>>({
      serviceUrl: `${RispoService.GET_PLACEMENT_TYPE_ENTRIES}`,
      parseResponse: true,
      additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }

  savePlacementTypeEntry(placement: PlasmanTypeEntry): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN_SAVE_PLACEMENT_TYPE;


    try {
      return this.httpService.submitRequestAndReturnData<boolean>({
        serviceUrl: `${RispoService.SAVE_PLACEMENT_TYPE_ENTRY}`,
        parseResponse: true,
        body: placement,
        additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
      }).pipe(
        catchError(e => {
          return throwError(this.errorHandler(e));
        })
      );
    } catch (e) {

      this.logger.info('Error updatePlacementEntry: ERROR: ' + e);
      return throwError(this.errorHandler(e));

    }


  }

  deletePlacementTypeEntry(placement: PlasmanTypeEntry): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    return this.httpService.submitRequestAndReturnData<boolean>({
      serviceUrl: `${RispoService.DELETE_PLACEMENT_TYPE_ENTRY}`,
      parseResponse: true,
      body: placement,
      additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>         CodebookService           <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  /**
   *
   */
  getCodebookEntries(): Observable<Array<CodebookEntry>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN_CODEBOOK;

    return this.httpService.submitGetRequestAndReturnData<Array<CodebookEntry>>({
      serviceUrl: `${RispoService.GET_CODEBOOK_ENTRIES}`,
      parseResponse: true,
      additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }

  deleteCodebookEntry(codebookEntry: CodebookEntry): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN_CODEBOOK;


    return this.httpService.submitRequestAndReturnData<boolean>({
      serviceUrl: `${RispoService.DELETE_CODEBOOK_ENTRY}`,
      parseResponse: true,
      body: codebookEntry,
      additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }

  saveCodebookEntry(data: CodebookEntry): Observable<boolean> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN;

    return this.httpService.submitRequestAndReturnData<boolean>({
      serviceUrl: `${RispoService.SAVE_CODEBOOK_ENTRY}`,
      parseResponse: true,
      body: data,
      additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>         InterestRateReferenceService           <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  /**
   *
   */
  getInterestRateEntries(): Observable<Array<InterestRateReference>> {

    const trackingToken = RispoService.CALL_TRACKING_TOKEN_INTEREST_RATE;

    return this.httpService.submitGetRequestAndReturnData<Array<InterestRateReference>>({
      serviceUrl: `${RispoService.GET_INTEREST_RATE_ENTRIES}`,
      parseResponse: true,
      additionalHeaders: new Headers({'x-call-tracking-token': trackingToken})
    }).pipe(
      catchError(e => {
        return throwError(this.errorHandler(e));
      })
    );

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>         Observables for all tables           <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  /**
   *
   *
   * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<    ReportsInProgressTable   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
   *
   * Method used to create custom datasource that is needed to show data in material table
   */
  getReportsInProgressTableData(): Observable<Array<Group>> {
    /*return this.reportsInProgressResponse$.map(responseData => responseData);*/
    return this.reportsInProgressResponse$;
  }

  /**
   *
   * ReportsInProgressTable
   *
   *
   */
  setReportsInProgressTableData(data: Array<Group>): void {
    this.pageMetadata.offset = 0;
    this.reportsInProgressData.next(data);
    this.setNewPaginationReportsInProgressTable(this.pageMetadata);
  }


  /**
   *
   *
   * ReportsInProgressTable
   *
   *
   */
  setNewPaginationReportsInProgressTable(pageMetaData: PageMetaData): void {
    // let clientData = this.clientListData.getValue();
    const start = pageMetaData.offset * pageMetaData.limit;
    const end = start + pageMetaData.limit;
    const data = this.reportsInProgressData.getValue().slice(start, end);
    this.reportsInProgressResponse$.next(data);
  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> HEADER CONFIG <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  setTitle(title: String): void {
    /*  const screenDescriptor = HeaderConfiguration.fromObject({'pageTitle': 'Rispo - ' + title});
    this.headerService.showDetailsHeader(screenDescriptor);*/
  }

  setDafaultTitle(): void {
    /*  const screenDescriptor = HeaderConfiguration.fromObject({'pageTitle': 'Rispo'});
    this.headerService.showDetailsHeader(screenDescriptor);*/
  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ERROR handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  errorHandler(error: any, message: string = 'ERROR: rispo.service => '): any {
    this.logger.info(message + ' -> ' + error);
    return error;
  }

}
