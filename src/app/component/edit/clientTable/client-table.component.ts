import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatSelectChange, MatTableDataSource} from '@angular/material';
import {ClientData} from '../../../model/client-data';
import {RispoService} from '../../../service/rispo.service';
import {Group, LoadGroupDataStatus} from '../../../model/group';
import {ReportStatus} from '../../../model/report-status';
import {Constants} from '../../../utilities/Constants';
import {Client} from '../../../model/client';
import {ActivatedRoute, Router} from '@angular/router';
import {Exposure} from '../../../model/exposure';
import {Collateral} from '../../../model/collateral';
import {TenorValidation} from '../../../model/TenorValidation';
import {UserService} from '../../../service/user.service';
import {ClientGroupingService} from '../../../service/client-grouping.service';
import {ClientDialogComponent} from './clientDialog/client-dialog.component';
import {ExposureTableComponent} from '../exposureTable/exposure-table.component';
import {SecurityService} from '../../../service/security.service';
import {ConfirmDialogComponent} from '../../../shared-module/component/confirm-dialog/confirm-dialog.component';
import {FetchClientDialogComponent} from './clientDialog/fetch-client-dialog.component';
import {ExposureDialogComponent} from '../exposureTable/exposureDialog/exposure-dialog.component';
import {ExposureGroupingService} from '../../../service/exposure-grouping.service';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {forkJoin, Subscription} from 'rxjs';
import {PageMetaData} from '../../../shared-module/table/page-meta-data';
import {SpinnerComponent} from '../../../shared-module/component/spinner-component/spinner.component';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';


@Component({
  selector: 'app-client-table',
  templateUrl: 'client-table.component.html',
  styleUrls: ['client-table.component.scss']
})
export class ClientTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  logger: Logger = LoggerFactory.getLogger('ClientTableComponent');

  pageMetaData: PageMetaData;


  numberOfEntries = 0;

  // dataSource: any = new GroupMembersTableDataSource(this.rispoService);
  dataSource = new MatTableDataSource<Client>();

  displayedColumns: any = [
    'checkBox',
    'nb',
    'orgJed',
    'mb_oib',
    'registerNumber',
    'borrower',
    'sndg',
    'country',
    'intRating',
    'pd',
    'ratingModel',
    'financialsEnclosed',
    'industry',
    'ownerName',
    'ratingRelation',
    'actions'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;


  dialogRef: MatDialogRef<ConfirmDialogComponent>;

  showGroupMemberMenu: any = [
    {'label': 'Svi članovi grupe', 'value': true},
    {'label': 'Samo oni članovi prema kojima postoji izloženost', 'value': false}
  ];

  currencyMenu: any = [
    {'label': 'HRK', 'value': 'HRK'},
    {'label': 'EUR', 'value': 'EUR'}
  ];


  private subscription: Subscription;
  private client: Client;
  private exposure: Exposure;
  private collateral: Collateral;
  private tenorValidation: TenorValidation;
  private tecaj: number;
  private id: any;
  group: Group;
  private index = 1;
  private indexWithExposure = 1;
  currency = 'HRK';
  showAllClients = false;
  private isFirstLaod = false;
  private clientFetchType = 1;
  private clientFetchValue: string;

  menu: any;
  menuDodaj: any;

  pageSize = 10;
  private loadGroupDataRef: Subscription;

  constructor(private securityService: SecurityService,
              public rispoService: RispoService,
              private clientGroupingService: ClientGroupingService,
              public userService: UserService,
              public dialog: MatDialog,
              private route: ActivatedRoute,
              private router: Router,
              private exsposureGroupingService: ExposureGroupingService,
              private messageBusService: MessageBusService) {
    super(messageBusService);
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;

    this.paginator._intl.itemsPerPageLabel = 'Broj prikazanih zapisa';
    this.client = new Client();
    this.group = new Group();
    this.exposure = new Exposure();
    this.collateral = new Collateral();
    this.tenorValidation = TenorValidation.DATE;
    this.tecaj = 0;
    this.showAllClientsOnChange(new MatSelectChange(null, this.showAllClients)); // initially selecting the first value
    this.currencyOnChange(new MatSelectChange(null, this.currency));


// *****************************************************************************************************************************************************************
//                                                                                               SUBSCRIBE logged user
// *********************************************************************************************************************************************************************


    try {
      this.isFirstLaod = false;

      this.id = +this.route.snapshot.params['id'];

      if (this.id) {
        const sub0 = this.userService.loggedUser.subscribe(user => {

            if (user.username !== '' && !this.isFirstLaod) {


              this.isFirstLaod = true;

              this.loadGroupData(this.id, this.userService.getLoggedUserUser().checkSecurity);

            }


          }
        );

        this.subscriptions.push(sub0);
      } else {
        this.redirectGeneric();
      }
    } catch (e) {
      this.redirectGeneric();

    }


// *****************************************************************************************************************************************************************
//                                                                                               SUBSCRIBE fetchClient subject
// *****************************************************************************************************************************************************************


    /*   todo ovo trebamoo  let sub = this.rispoService.fetchClient.subscribe(response => {

          this.fetchClient(response.searchValue);

        }, error1 => {
          this.log('Error in subscribe fetchClient ' + error1);

        });

        this.subscriptions.push(sub);*/

    let sub = this.getMessage<{ searchValue: string }>(ReceiverID.RECEIVER_ID_FETCH_CLIENT).subscribe(value => {
      this.fetchClient(value.searchValue);

    }, error1 => {
      this.log('Error in subscribe fetchClient ' + error1);
    });

    this.subscriptions.push(sub);

// *****************************************************************************************************************************************************************
//                                                                                               SUBSCRIBE loadGroupData subject
// *****************************************************************************************************************************************************************


    sub = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value => {

      if (value.status === LoadGroupDataStatus.LOAD_NEW_GROUP_DATA) {
        this.loadGroupData(value.id, this.userService.getLoggedUserUser().checkSecurity).then(group => {
          // this.rispoService.loadGroupData.next();
          this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA, {
            'id': group.id.toString(10),
            'status': LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED
          });
        });
      }

    }, error1 => {
      this.log('Error in subscribe loadGroupData ' + error1);

    });

    this.subscriptions.push(sub);

// *****************************************************************************************************************************************************************
//                                                                                               SUBSCRIBE CLIENT TABLE DATA
// *****************************************************************************************************************************************************************
    sub = this.rispoService.reportDetailsGroupData.subscribe(responseData => {
      this.refreshPageMetadata(responseData);

      this.group = responseData;

      if (this.group.name && this.group.kpo) {
        this.rispoService.setTitle(this.group.name + ' (' + this.group.kpo + ') ');
      }


      // this.log('REFRESH_   ' + JSON.stringify(responseData));

      this.resetClientComponent();
      this.setNewPaginationDataClientTableData_GroupMembers();

    });

    this.subscriptions.push(sub);


  }

  private refreshPageMetadata(group: Group): void {
    if (group.members !== undefined && group.members !== null) {
      if (this.showAllClients) {
        this.numberOfEntries = group.members.length;
      } else {

        const clientDataFilter: Client[] =
          group.members
            .filter(client => ((client.exposures !== null && client.exposures !== undefined && client.exposures.length !== 0) || client.manualInput || client.error));
        this.numberOfEntries = clientDataFilter.length;

      }

      // this.log('REFRESH_   ' + JSON.stringify(responseData));

    }
  }

  public showAllClientsOnChange(event: MatSelectChange): void {
    this.sendMessage(ReceiverID.RECEIVER_ID_SHOW_MEMBERS, event.value);

    this.pageMetaData = new PageMetaData();

    this.pageMetaData.offset = 0;

    this.pageMetaData.limit = this.pageSize;
    this.refreshPageMetadata(this.rispoService.getReportsDetailsGroup());
    this.resetClientComponent();
    this.rispoService.setNewPaginationDataClientTableData_GroupMembers(this.pageMetaData, event.value);

    this.setNewPaginationDataClientTableData_GroupMembers(event.value);


  }

  public currencyOnChange(event: MatSelectChange): void {
    this.sendMessage(ReceiverID.RECEIVER_ID_CURRENCY, event.value);
  }


  // *************************************************************************************************************************************************************************************
//                                                                                                                    LOAD GROUP DATA --- BEGIN
// *************************************************************************************************************************************************************************************


  /**
   * Učitavanje grupe
   *
   * @param id
   *            id grupe
   * @param checkSecurity
   *            zastavica koja označava dali je potrebno provjeravati security
   *            Kod prvog učitavanja je potrebno, kod ostalih ne.
   */
  private loadGroupData(id: string, checkSecurity: boolean): Promise<Group> {


    return new Promise<Group>((resolve, reject) => {

      try {
        this.index = 1;
        this.indexWithExposure = 1;

// FETCH GROUP
        const sub0 = this.rispoService.findOne(id).subscribe(response => {

            this.group = response;
            this.rispoService.setReportsDetailsGroup(this.group);


            if (checkSecurity) {

              this.securityService.imaPravoNaGrupu(this.rispoService.getReportsDetailsGroup(), this.userService.getLoggedUserUser().orgJeds).then(responseImaPravoNaGrupu => {
// todo check ima pravo na grupu
                if (responseImaPravoNaGrupu) {

                  checkSecurity = false;  // ima pravo na grupu, nemoramo gledati klijente

                  this.loadGroupMembers(id, checkSecurity).then(value => {
                    const group = value;

                    for (const c of group.members) {
                      if (c.shouldHaveExposure() && c.error) {
                        this.addMessage('GREŠKA', 'Dogodila se greska kod dohvata izlozenosti za klijente obojane crvenom bojom. Pokusajte rucno ponoviti dohvat samo za te klijente!');
                        break;
                      }
                    }


                    resolve(value);


                  });

                } else {

                  //  nema pravo na grupu i grupa ima status U_RADU
                  // - nema prava jer za listu izvještaja u radu provjeravamo u bazi grupu i klijente
                  // jedini način da se ovo desi jest pristup direktno preko linka

                  if (this.rispoService.getReportsDetailsGroup().status === ReportStatus.IN_PROGRESS) {
                    this.redirect();
                    // todo return??
                    return;
                  }

                }

              }, error1 => {

                this.log('ERROR imaPravoNaGrupu (' + id + '): ' + error1);
                this.loadGroupDataErrorHandling(error1);
              });

              // this.subscriptions.push(sub1);

            } else {

              this.loadGroupMembers(id, checkSecurity).then(value => {

                const group = value;

                for (const c of group.members) {
                  if (c.shouldHaveExposure() && c.error) {
                    this.addMessage('GREŠKA', 'Dogodila se greska kod dohvata izlozenosti za klijente obojane crvenom bojom. Pokusajte rucno ponoviti dohvat samo za te klijente!');
                    break;
                  }
                }

                resolve(value);
              });
            }

          },
          error1 => {
            this.log('ERROR loadGroupData>findOne (' + id + '): ' + error1);
            this.loadGroupDataErrorHandling(error1);

          }
        );

        this.subscriptions.push(sub0);


      } catch (e) {
        this.log('ERROR loadGroupData' + e);
        this.loadGroupDataErrorHandling(e);

      }

    });

  }

  private loadGroupMembers(id: string, checkSecurity: boolean): Promise<Group> {


    return new Promise<Group>((resolve, reject) => {

      try {

        this.loadGroupMembersAsPromise().then(group => {

          if (group.members !== null) {

            //         this.rispoService.setReportsDetailsGroup(group);

            this.checkSecurityAndloadExposure(group, checkSecurity).then(value => {

              value.refreshIndexes();

              this.rispoService.setReportsDetailsGroup(value);

              resolve(value);

            }, reason => {

              this.log('ERROR loadGroupMembers (' + id + '): ' + reason);
              this.loadGroupDataErrorHandling(reason);

            });

          }


        }, reason => {

          this.log('ERROR loadGroupMembers (' + id + '): ' + reason);
          this.loadGroupDataErrorHandling(reason);
        });


      } catch (e) {

        this.log('ERROR loadGroupMembers (' + id + '): ' + e);
        this.loadGroupDataErrorHandling(e);

      }

    });


  }

  private loadGroupMembersAsPromise(): Promise<Group> {


    return new Promise<Group>((resolve, reject) => {

      try {

        this.log('Dohvacena grupa sa ID-jem ' + this.rispoService.getReportsDetailsGroup().id);

        if (this.rispoService.getReportsDetailsGroup() !== null && this.rispoService.getReportsDetailsGroup().id !== null) {

          this.currency = this.rispoService.getReportsDetailsGroup().currency;

          this.rispoService.clientsForGroup(this.rispoService.getReportsDetailsGroup().id).subscribe(members => {

            this.group = this.rispoService.getReportsDetailsGroup();

            this.group.members = members;

            resolve(this.group);

          }, error1 => {
            this.log('ERROR loadGroupDataSecondPart -> clientsForGroup(' + this.group.id + '): ' + error1);

            reject(error1);

          });

        }

      } catch (e) {
        this.log('ERROR: loadGroupMembersAsPromise -> ' + e);
        reject(e);
      }

    });


  }

  private checkSecurityAndloadExposure(group: Group, checkSecurity: boolean): Promise<Group> {

    return new Promise<Group>((resolve, reject) => {

      try {
        if (checkSecurity) {

          const promiseList: Array<Promise<boolean>> = new Array<Promise<boolean>>();

          group.members.forEach(member => {

            promiseList.push(this.securityService.imaPravoNaKlijenta(member, this.userService.getLoggedUserUser()));

          });


          const subConcat = forkJoin(
            promiseList
          ).subscribe(response => {
              response.forEach(value => {

                if (checkSecurity && !response) {
                  this.redirect();
                  subConcat.unsubscribe();
                }

              });


            }, (error1) => {

              this.log('ERROR imaPravoNaKlijenta' + error1);
              // this.loadGroupDataErrorHandling(error1);
              reject(error1);

            }, () => {

              resolve(this.loadExposureForEachMembers());
            }
          );


          this.subscriptions.push(subConcat);

        } else {

          resolve(this.loadExposureForEachMembers());

        }


      } catch (e) {
        this.log('ERROR: loadGroupMembersAsPromise -> ' + e);
        reject(e);
      }

    });
  }

  private loadExposureForEachMembers(): Promise<Group> {

    return new Promise<Group>((resolve, reject) => {

      try {

        const membersPromiseArray: Array<Promise<Client>> = new Array<Promise<Client>>();

        this.group.members.forEach(member => {

          this.group = this.rispoService.getReportsDetailsGroup();

          this.group.updateIntRate(member.intRateHRK, member.intRateEUR);
          this.group.updateFees(member.feesHRK, member.feesEUR);
          member.index = this.index++;

          if (member.provjeriVrstuOsobe(Client.VRSTA_OSOBE_ZEMLJA)) {
            member.indexWithExposures = this.indexWithExposure;
            this.indexWithExposure++;
            return;
          }

          membersPromiseArray.push(this.loadExposureForMember(member));


        });

        forkJoin(
          membersPromiseArray
        ).subscribe(clients => {

          clients.forEach(clientNew => {

            for (let i = 0; !!this.group.members && i < this.group.members.length; i++) {

              if (this.group.members[i].id === clientNew.id) {

                this.group.members[i] = clientNew;

                continue;


              }

            }


          });

        }, error1 => {
          reject(error1);
        }, () => {
          resolve(this.group);
        });


      } catch (e) {
        this.log('ERROR: loadExposureForEachMembers -> ' + e);
        reject(e);
      }

    });


  }

  private loadExposureForMember(member: Client): Promise<Client> {

    return new Promise<Client>((resolve, reject) => {

      try {

        let promiseArrayExposure: Promise<Array<Exposure>> = null;


        if (member.grouped) {

          promiseArrayExposure = this.rispoService.findByGroupedOwnerId(member.id).toPromise();

        } else {

          promiseArrayExposure = this.rispoService.findByOwnerId(member.id).toPromise();

        }

        promiseArrayExposure.then(response => {

          member.exposures = response;

          if (member.exposures === undefined || member.exposures === null || member.exposures.length === 0) {

            if (member.manualInput || member.error) {

              member.indexWithExposures = this.indexWithExposure;
              this.indexWithExposure++;

            }

            resolve(member);


          } else {

            resolve(this.laodCollateralsForEachExposure(member));

          }


        }, reason => {

          reject(reason);

        });


      } catch (e) {
        this.log('ERROR: loadExposureForMember -> ' + e);
        reject(e);
      }

    });


  }

  private laodCollateralsForEachExposure(member: Client): Promise<Client> {

    return new Promise<Client>((resolve, reject) => {

      // let group: Group = this.rispoService.getReportsDetailsGroup();
      try {
        if (member.exposures != null && member.exposures.length !== 0) {

          member.indexWithExposures = this.indexWithExposure;
          this.indexWithExposure++;
          const exposurePromiseArray: Array<Promise<Exposure>> = new Array<Promise<Exposure>>();

          member.exposures.forEach(exposure => {
            member.total.add(exposure);
            this.group.total.add(exposure);
            exposurePromiseArray.push(this.findCollateralByOwnerId(exposure));

          });


          forkJoin(
            exposurePromiseArray
          ).subscribe(exposureArray => {

              // exposureNew is exposure with collaterals

              // this.rispoService.setReportsDetailsGroup(group);

              exposureArray.forEach(exposureNew => {

                for (let i = 0; i < member.exposures.length; i++) {

                  if (member.exposures[i].id === exposureNew.id) {

                    member.exposures[i] = exposureNew;

                    continue;

                  }

                }


              });


            }, error1 => {

              reject(error1);

            }, () => {

              resolve(member);

            }
          );

        } else if (member.manualInput || member.error) {

          member.indexWithExposures = this.indexWithExposure;
          this.indexWithExposure++;
          resolve(member);


        }


      } catch (e) {
        this.log('ERROR: laodCollateralsForEachExposure -> ' + e);
        reject(e);
      }

    });


  }

  private findCollateralByOwnerId(exposure: Exposure): Promise<Exposure> {

    return new Promise<Exposure>((resolve, reject) => {

      try {

        const sub = this.rispoService.findCollateralByOwnerId(exposure.id).subscribe(response => {
          exposure.collaterals = response;
          resolve(exposure);
        }, error1 => {

          reject(error1);
        });
        this.subscriptions.push(sub);

      } catch (e) {

        this.log('ERROR: findCollateralByOwnerId -> ' + e);
        reject(e);

      }

    });


  }

  private loadGroupDataErrorHandling(e: any): void {
    this.log('Greska kod ucitavanja grupe' + e.toString());
    this.addMessage(Constants.GROUP_FETCH.toString(), Constants.GROUP_FETCH_ERROR.toString());
    this.redirectGeneric(); //  NT

  }

  private redirectGeneric(): void {

    this.router.navigate(['../../genericError'], {relativeTo: this.route});


  }

  private redirect(): void {

    this.router.navigate(['../editDenied'], {relativeTo: this.route});

  }

// *************************************************************************************************************************************************************************************
//                                                                                                                    LOAD GROUP DATA --- END
// *************************************************************************************************************************************************************************************

  /**
   * dohvat člana
   */
  private fetchClient(searchValue: string): void {

    try {


      this.rispoService.azurirajIzlozenostClana(this.rispoService.getReportsDetailsGroup().id, searchValue, this.userService.getLoggedUserUser().username).subscribe(response => {

        if (response.error) {

          this.addMessage('Dohvat podataka clana', response.errorMsg);

        } else {

          // todo check security?? HC false or real state from user service?
          this.loadGroupData(this.rispoService.getReportsDetailsGroup().id.toString(), false).then(group => {

            for (let i = 0; i < group.members.length; i++) {
              const c: Client = group.members[i];

              if (c.id === response.id) {

                c.manualInput = true;
                this.rispoService.clientSave(c).subscribe(value => {

                  this.addMessage('Dohvat podataka clana ', 'Clan uspjesno dohvacen');

                }, error1 => {
                  this.addMessage('Dohvat podataka clana', 'Greška prilikom spremanja člana! ');
                  this.log('ERROR: fetchClient -> ' + error1);

                });
                break;

              }

            }


          });


        }

      }, error1 => {
        this.addMessage('Dohvat podataka clana', 'Greška prilikom spremanja člana! ');
        this.log('ERROR: fetchClient -> ' + error1);

      });


    } catch (e) {

      this.addMessage('Dohvat podataka clana', 'Greška prilikom spremanja člana! ');

      this.log('ERROR: fetchClient -> ' + e);

    }


  }


  private changeOwnerIfDifferent(): Promise<boolean> {


    return new Promise<boolean>((resolve, reject) => {

      try {
        if (this.userService.getLoggedUserUser().username !== this.rispoService.getReportsDetailsGroup().owner) {
          this.rispoService.updateGroupOwner(this.rispoService.getReportsDetailsGroup().id, this.userService.getLoggedUserUser().username).subscribe(value => {

            if (value) {
              resolve(true);
            } else {
              resolve(false);
            }

          }, error1 => {
            reject('Greska kod azuriranja vlasnika grupe ' + this.rispoService.getReportsDetailsGroup().id + ' - ' + error1);
            // throw new Error('Greska kod azuriranja vlasnika grupe ' + this.rispoService.getReportsDetailsGroup().id + ' - ' + error1);
          });
        } else {
          resolve(true);
        }
      } catch (e) {
        reject('Greska kod azuriranja vlasnika grupe ' + this.rispoService.getReportsDetailsGroup().id + ' - ' + e);
        //  throw new Error('Greska kod azuriranja vlasnika grupe ' + this.rispoService.getReportsDetailsGroup().id + ' - ' + e);
      }


    });


  }


  save(client: Client): void {

    try {

      this.rispoService.clientSave(client).subscribe(clientResponse => {

        if (client.id === undefined || client.id === null) {

          const group: Group = this.rispoService.getReportsDetailsGroup();
          group.members.push(clientResponse);
          group.refreshIndexes();
          this.rispoService.setReportsDetailsGroup(group);
          this.addMessage(Constants.CLIENT_ADD.toString(), Constants.CLIENT_ADD_SUCCESS[0] + ' ' + (clientResponse.borrower ? clientResponse.borrower : ' ') + ' ' + Constants.CLIENT_ADD_SUCCESS[1]);


        } else {

          this.addMessage(Constants.CLIENT_UPDATE.toString(), Constants.CLIENT_UPDATE_SUCCESS[0] + ' ' + (clientResponse.borrower ? clientResponse.borrower : ' ') + ' ' + Constants.CLIENT_UPDATE_SUCCESS[1]);


        }

        this.changeOwnerIfDifferent().then(value => {
        }, reason => {
          this.log(Constants.CLIENT_SAVE + ' - ' + Constants.CLIENT_SAVE_ERROR + ' ERROR: ' + reason);
          this.addMessage(Constants.CLIENT_SAVE.toString(), +Constants.CLIENT_SAVE_ERROR + ' changeOwnerIfDifferent ERROR');
        });

      }, error1 => {

        this.log(Constants.CLIENT_SAVE + ' - ' + Constants.CLIENT_SAVE_ERROR + ' ERROR: ' + error1);
        this.addMessage(Constants.CLIENT_SAVE.toString(), Constants.CLIENT_SAVE_ERROR.toString());

      }, () => {

      });


    } catch (e) {

      this.log(Constants.CLIENT_SAVE + ' - ' + Constants.CLIENT_SAVE_ERROR + ' ERROR: ' + e);
      this.addMessage(Constants.CLIENT_SAVE.toString(), Constants.CLIENT_SAVE_ERROR.toString());


    }

  }

  remove(client: Client): void {

    this.dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: 'Brisanje klijenta',
          question: 'Jeste li sigurni da želite obrisati odabranog klijenta?'
        },
        width: '25%'
      });

    this.dialogRef.afterClosed().subscribe(value => {

      const result: boolean = value;

      if (result) {

        this.removeClient(client);

      }

    }, error1 => {

      this.log('Greška prilikom otvaranja dialoga za potvrdu brisanja klijenta. Klijent id: ' + client.id + ' ERROR-> ' + JSON.stringify(error1));

    }, () => {

    });

  }

  private removeClient(client: Client): void {

    try {

      const promiseArray: Array<Promise<any>> = new Array<Promise<any>>();


      promiseArray.push(this.rispoService.clientDelete(client).toPromise());
      promiseArray.push(this.changeOwnerIfDifferent());

      const subConcat = forkJoin(
        promiseArray
      ).subscribe(response => {

          const group = this.rispoService.getReportsDetailsGroup();

          group.members = group.members.filter(obj => obj.id !== client.id);

          group.refreshIndexes();

          this.rispoService.setReportsDetailsGroup(group);
          this.showAllClientsOnChange(new MatSelectChange(null, this.showAllClients));

        }, (error1) => {

          this.addMessage(Constants.CLIENT_REMOVE.toString(), Constants.CLIENT_REMOVE_ERROR.toString());

          this.log('Greska kod brisanja klijenta sa ID-jem ' + client.id + ' ERROR: ' + JSON.stringify(error1));

        }, () => {
          this.addMessage(Constants.CLIENT_REMOVE.toString(), Constants.CLIENT_REMOVE_SUCCESS[0] + ' ' + (client.borrower ? client.borrower : ' ') + ' ' + Constants.CLIENT_REMOVE_SUCCESS[1]);
        }
      );


      this.subscriptions.push(subConcat);


    } catch (e) {

      this.addMessage(Constants.CLIENT_REMOVE.toString(), Constants.CLIENT_REMOVE_ERROR.toString());

      this.log('Greska kod brisanja klijenta sa ID-jem ' + client.id);

    }
  }


  unGroupClient(client: Client): void {

    this.dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: 'Grupiranje klijenta',
          question: 'Jeste li sigurni da želite razdvojiti grupiranog klijenta?'
        },
        width: '25%'
      });

    this.dialogRef.afterClosed().subscribe(value => {

      const result: boolean = value;

      if (result) {

        this.unGroupClientCallWs(client);

      }

    }, error1 => {

      this.log('Greška prilikom otvaranja dialoga za potvrdu odgrupiravanja.' + JSON.stringify(error1));

    }, () => {

    });

  }


  private unGroupClientCallWs(client: Client): void {
    const promiseArray: Array<Promise<any>> = new Array<Promise<any>>();

    try {
      promiseArray.push(this.rispoService.exposureUngroupForClient(client.id).toPromise());
      promiseArray.push(this.rispoService.clientUngroup(client).toPromise());
      promiseArray.push(this.rispoService.clientDelete(client).toPromise());
      promiseArray.push(this.changeOwnerIfDifferent());

      const subConcat = forkJoin(
        promiseArray
      ).subscribe(response => {

          this.loadGroupData(this.rispoService.getReportsDetailsGroup().id.toString(), this.userService.getLoggedUserUser().checkSecurity);


        }, (error1) => {

          this.addMessage(Constants.CLIENT_GROUP.toString(), Constants.CLIENT_UDGROUP_ERROR.toString());

          this.log('Greska kod odgrupiravanja klijenta sa ID-jem ' + client.id + ' ERROR: ' + JSON.stringify(error1));

          this.loadGroupData(this.rispoService.getReportsDetailsGroup().id.toString(), this.userService.getLoggedUserUser().checkSecurity);

          // todo za razmisliti  throw new Error(error1);

        }, () => {
          this.addMessage(Constants.CLIENT_GROUP.toString(), Constants.CLIENT_UDGROUP_SUCCESS.toString());
        }
      );


      this.subscriptions.push(subConcat);


    } catch (e) {

      this.addMessage(Constants.CLIENT_GROUP.toString(), Constants.CLIENT_UDGROUP_ERROR.toString());

      this.log('Greska kod odgrupiravanja klijenta sa ID-jem ' + client.id);

    }
  }

  setPrimaryMember(client: Client): void {

    try {

      this.rispoService.clientSetPrimaryMember(client).subscribe(value => {


        this.loadGroupDataRef = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
          if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
            this.showAllClientsOnChange(new MatSelectChange(null, this.showAllClients));

            this.addMessage(Constants.CLIENT_UPDATE.toString(), Constants.CLIENT_PRIMARY_SUCCESS.toString());

            this.loadGroupDataRef.unsubscribe();
          }
        }, error1 => {
          this.loadGroupDataRef.unsubscribe();
        });

        // todo  u staroj app je check security HC na "false"
        // this.rispoService.loadGroupData.next();

        this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA, {
          'id': this.rispoService.getReportsDetailsGroup().id.toString(),
          'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
        });

      }, error1 => {

        this.log(Constants.CLIENT_UPDATE + ' - ' + Constants.CLIENT_PRIMARY_ERROR + ' ERROR: ' + error1);
        this.addMessage(Constants.CLIENT_UPDATE.toString(), Constants.CLIENT_PRIMARY_ERROR.toString());

      }, () => {

      });


    } catch (e) {

      this.log(Constants.CLIENT_UPDATE + ' - ' + Constants.CLIENT_PRIMARY_ERROR + ' ERROR: ' + e);
      this.addMessage(Constants.CLIENT_UPDATE.toString(), Constants.CLIENT_PRIMARY_ERROR.toString());


    }

  }

  createExposure(client: Client, group: Group): void {
    this.dialog.open(ExposureDialogComponent,
      {
        data: {
          group: group,
          client: client
        }
      });
  }


  refreshClientData(client: Client): void {

    try {

      this.rispoService.azurirajIzlozenostClana(this.rispoService.getReportsDetailsGroup().id, client.registerNumber, this.userService.getLoggedUserUser().username).subscribe(response => {

        if (response.error) {

          this.log('Azuriranje podataka clana ' + response.errorMsg);
          this.addMessage('Azuriranje podataka clana ', response.errorMsg);

        } else {
          this.rispoService.clientDelete(client).subscribe(value => {


            this.loadGroupDataRef = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
              if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
                this.addMessage('Azuriranje podataka clana', 'Podaci azurirani');

                this.loadGroupDataRef.unsubscribe();
              }
            }, error1 => {
              this.loadGroupDataRef.unsubscribe();
            });


            // this.rispoService.loadGroupData.next();

            this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
              {
                'id': this.rispoService.getReportsDetailsGroup().id.toString(),
                'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
              }
            );


          }, error1 => {

            this.log('Azuriranje podataka clana - Greska tijekom azuriranja podataka clana ' + ' ERROR: ' + error1);
            this.addMessage('Azuriranje podataka clana', 'Greska tijekom azuriranja podataka clana');

          }, () => {

          });


        }


        // this.rispoService.loadGroupData.next();

        this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
          {
            'id': this.rispoService.getReportsDetailsGroup().id.toString(),
            'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
          }
        );

      }, error1 => {

        this.log('Azuriranje podataka clana - Greska tijekom azuriranja podataka clana ' + ' ERROR: ' + error1);
        this.addMessage('Azuriranje podataka clana', 'Greska tijekom azuriranja podataka clana');

      }, () => {

      });


    } catch (e) {

      this.log('Azuriranje podataka clana", "Greska tijekom azuriranja podataka clana ' + ' ERROR: ' + e);
      this.addMessage('Azuriranje podataka clana', 'Greska tijekom azuriranja podataka clana');


    }

  }


  addNewClient(): void {

    const client: Client = new Client();
    client.groupId = this.rispoService.getReportsDetailsGroup().id;
    this.client = client;

    try {

      this.dialog.open(ClientDialogComponent,
        {
          data: {
            client: client
          }
        });

    } catch (e) {

      this.log('Greška kod otvaranja dialoga za editiranje klijenta.');

    }

  }

  addExistingClient(): void {

    this.clearRegNumber();

    const client: Client = new Client();
    client.groupId = this.rispoService.getReportsDetailsGroup().id;
    this.client = client;

    try {

      this.dialog.open(FetchClientDialogComponent,
        {
          data: {
            client: client
          }
        });

    } catch (e) {

      this.log('Greška kod otvaranja dialoga za editiranje klijenta.');

    }

  }

  private clearRegNumber(): void {

    this.clientFetchValue = '';
    this.clientFetchType = 1;

  }

  lock(): void {

    this.dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: 'Zaključavanje izvještaja',
          question: 'Jeste li sigurni da želite zaključati izvještaj?'
        },
        width: '25%'
      });

    this.dialogRef.afterClosed().subscribe(value => {

      const result: boolean = value;

      if (result) {

        this.lockGroup();

      }

    }, error1 => {

      this.log('Greska kod zakljucavanja grupe' + JSON.stringify(error1));
      this.addMessage(Constants.GROUP_LOCK.toString(), Constants.GROUP_LOCK_ERROR.toString());

    }, () => {

    });


  }

  private lockGroup(): void {

    try {

      this.rispoService.lockGroup(this.rispoService.getReportsDetailsGroup()).subscribe(response => {


        this.changeOwnerIfDifferent().then(value => {


          this.loadGroupDataRef = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
            if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
              this.addMessage(Constants.GROUP_LOCK.toString(), Constants.GROUP_LOCK_SUCCESS.toString());
              this.loadGroupDataRef.unsubscribe();
            }
          }, error1 => {
            this.loadGroupDataRef.unsubscribe();
          });

          // this.rispoService.loadGroupData.next();

          this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
            {
              'id': this.rispoService.getReportsDetailsGroup().id.toString(),
              'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
            }
          );


        }, reason => {
          this.log('Greska kod zakljucavanja grupe' + JSON.stringify(reason));
          this.addMessage(Constants.GROUP_LOCK.toString(), Constants.GROUP_LOCK_ERROR.toString());
        });

      }, error1 => {

        this.log('Greska kod zakljucavanja grupe' + JSON.stringify(error1));
        this.addMessage(Constants.GROUP_LOCK.toString(), Constants.GROUP_LOCK_ERROR.toString());

      }, () => {

      });


    } catch (e) {

      this.log('Greska kod zakljucavanja grupe' + JSON.stringify(e));
      this.addMessage(Constants.GROUP_LOCK.toString(), Constants.GROUP_LOCK_ERROR.toString());

    }

  }

  /**
   * Predgrupiranje - grupiraju se odabrani klijenti i prikazuje se modal za
   * unos novog klijenta sa popunjenim zajedničkim podacima od odabranih
   * klijenata.
   */
  groupClients(): void {

    try {

      this.client = this.clientGroupingService.group(this.rispoService.getReportsDetailsGroup().members);
      this.client.owner = this.userService.getLoggedUserUser().username;

      this.dialog.open(ClientDialogComponent,
        {
          data: {
            client: this.client
          }
        });

    } catch
      (e) {
      this.addMessage(Constants.CLIENT_GROUP.toString(), Constants.CLIENT_GROUP_ERROR + ' - ' + e.message);
    }

  }

  exportToExcel(): void {

    try {

      if (!this.canExportGroup()) {
        // u staroj app se radi refresh stranice (ponovno dohvacanje grupe), uzima puno vremena pa sam ovo zakomentirao
        // this.rispoService.loadGroupData.next({'id': this.rispoService.getReportsDetailsGroup().id.toString(), 'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA});
        return;
      }

      const tmpGroup: Group = this.groupRetailExposures(this.rispoService.getReportsDetailsGroup());
      this.rispoService.populateWorkbook(tmpGroup, tmpGroup.reportDate, this.currency, this.createFileName()).subscribe(value => {
        this.log('Uspješno kreiran Excell report');

        // this.rispoService.loadGroupData.next();

        this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
          {
            'id': this.rispoService.getReportsDetailsGroup().id.toString(),
            'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
          }
        );

      });

    } catch (e) {

      this.log('Greska kod exporta grupe sa ID-jem ' + this.rispoService.getReportsDetailsGroup().id + ' - ' + JSON.stringify(e));
      this.addMessage(Constants.EXPORT_EXCEL.toString(), Constants.EXPORT_EXCEL_ERROR.toString());

      // this.rispoService.loadGroupData.next();

      this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
        {
          'id': this.rispoService.getReportsDetailsGroup().id.toString(),
          'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
        }
      );

    }


  }

  private createFileName(): string {
    return 'RISPO_' + this.rispoService.getReportsDetailsGroup().name + '_' + this.rispoService.getReportsDetailsGroup().reportDateAsString;
  }

  private groupRetailExposures(group: Group): Group {

    group.members.forEach(client => {

      let clientExposures: Array<Exposure> = client.exposures;
      const retailSTExposures: Array<Exposure> = new Array<Exposure>();
      const retailLTExposures: Array<Exposure> = new Array<Exposure>();

      for (let i = 0; i < clientExposures.length; i++) {
        const exposure: Exposure = clientExposures[i];

        if (exposure.typeOfCredit.toUpperCase() === 'Retail Exposure ST'.toUpperCase()) {
          retailSTExposures.push(exposure);
        }

        if (exposure.typeOfCredit.toUpperCase() === 'Retail Exposure LT'.toUpperCase()) {
          retailLTExposures.push(exposure);
        }
      } // END FOR

      if (retailSTExposures.length !== 0 && (retailSTExposures.length > 1)) {
        // let retailSTExposure: Exposure = ExposureGroupingUtil.group(retailSTExposures);
        const retailSTExposure: Exposure = this.exsposureGroupingService.group(retailSTExposures);

        retailSTExposure.typeOfCredit = 'Retail Exposure ST (grouped)';

        clientExposures = this.removeAll(retailSTExposures, clientExposures);
        clientExposures.push(retailSTExposure);
      }

      if (retailLTExposures.length !== 0 && (retailLTExposures.length > 1)) {
        // let retailLTExposure: Exposure = ExposureGroupingUtil.group(retailLTExposures);
        const retailLTExposure: Exposure = this.exsposureGroupingService.group(retailLTExposures);

        retailLTExposure.typeOfCredit = 'Retail Exposure LT (grouped)';

        clientExposures = this.removeAll(retailLTExposures, clientExposures);
        clientExposures.push(retailLTExposure);
      }

      client.exposures = clientExposures;


    }); // END FOREACH

    return group;

  }


  private removeAll(itemsForDelete: Array<Exposure>, mainArray: Array<Exposure>): Array<Exposure> {

    for (let i = 0; i < itemsForDelete.length; i++) {
      const exposure: Exposure = itemsForDelete[i];

      mainArray = mainArray.filter(obj => obj !== exposure);

    }

    return mainArray;

  }


  /**
   * Provjera dali se grupa može exportati. Nemože se exportat prazna grupa i
   * grupa sa više od 40 članova - ograničenje excel tablice.
   */
  private canExportGroup(): boolean {
    const group: Group = this.rispoService.getReportsDetailsGroup();

    if (group === null) {
      this.addMessage(Constants.EXPORT_EXCEL.toString(), Constants.EXPORT_EXCEL_GROUP.toString());
      return false;
    }
    const numberOfMembersWithExposure: number = this.countMembersWithExposure();

    if (numberOfMembersWithExposure === 0) {
      this.addMessage(Constants.EXPORT_EXCEL.toString(), Constants.EXPORT_EXCEL_EMPTY.toString());
      return false;
    }

    if (numberOfMembersWithExposure > 40) {
      this.addMessage(Constants.EXPORT_EXCEL.toString(), Constants.EXPORT_EXCEL_LIMIT.toString());
      return false;
    }

    return true;

  }


  private countMembersWithExposure(): number {
    const group: Group = this.rispoService.getReportsDetailsGroup();

    if (group.members === undefined || group.members === null || group.members.length === 0) {
      return 0;
    }

    let count = 0;

    group.members.forEach(m => {
      if (m.exposures !== undefined && m.exposures !== null && m.exposures.length !== 0) {
        count++;
      }
    });

    return count;

  }

  openGroupExoposureTableDialog(): void {


    this.dialog.open(ExposureTableComponent,
      {
        data: {
          currency: this.currency
        }
      });

  }

  editClient(client: Client): void {


    try {

      this.dialog.open(ClientDialogComponent,
        {
          data: {
            client: client,
            isEditMode: true
          }
        });

    } catch (e) {

      this.log('Greška kod otvaranja dialoga za editiranje klijenta.');

    }


  }


  getBackgroundColor(client: Client): string {
    if (!client.includedInReport) {
      return 'rgba(60,98,155,0.102)';
    } else if (client.error && client.shouldHaveExposure()) {
      return '#ffebea';
    } else if (client.selected) {
      return 'rgba(60,98,155,0.102)';
    } else {
      return '';
    }
  }

  isThisMemberDisplayed(client: Client): string {


    if (this.showAllClients || (client.exposures !== null && client.exposures !== undefined && client.exposures.length !== 0) || client.manualInput || client.error) {
      return '';
    } else {
      return 'none';
    }

  }

  isClientGrouped(client: Client): boolean {


    if (client.grouped) {
      return true;
    } else {
      return false;
    }

  }


  showActionsColumn(): boolean {

    return this.userService.canEditData() && !this.rispoService.getReportsDetailsGroup().isLocked;

  }


  /**
   * Reset search values to blank strings and reload all table data
   */
  resetClientComponent(): void {

    this.paginator.pageIndex = 0;

  }



  setNewPaginationDataClientTableData_GroupMembers(showAllClients: boolean = false): void {

    if (this.rispoService.getReportsDetailsGroup().members !== undefined && this.rispoService.getReportsDetailsGroup().members !== null) {

      //   this.reportDetailsGroupMembersResponse$.next(clientData);

      if (showAllClients) {
        // let clientData: Client[] = this.reportDetailsGroupData.getValue().members.slice(start, end);
        // this.reportDetailsGroupMembersResponse$.next(this.reportDetailsGroupData.getValue().members.slice(start, end));
        this.dataSource.data = this.rispoService.getReportsDetailsGroup().members;

      } else {
        const clientDataFilter: Client[] = this.rispoService.getReportsDetailsGroup().members
          .filter(client => ((client.exposures !== null && client.exposures !== undefined && client.exposures.length !== 0) || client.manualInput || client.error));
        // this.reportDetailsGroupMembersResponse$.next(clientDataFilter.slice(start, end));
        this.dataSource.data = clientDataFilter;
      }

    }

  }


  ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this.subscription != null) {

      this.subscription.unsubscribe();

    }

    if (this.loadGroupDataRef) {
      this.loadGroupDataRef.unsubscribe();
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.rispoService.setDafaultTitle();
    const group = new Group();
    group.members = new Array<Client>();
    this.rispoService.setReportsDetailsGroup(group);

  }


}
