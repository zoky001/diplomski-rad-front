import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatTableDataSource} from '@angular/material';
import {ClientData} from '../../../model/client-data';
import {RispoService} from '../../../service/rispo.service';
import {Group} from '../../../model/group';
import {ReportStatus} from '../../../model/report-status';
import {ActivatedRoute, Router} from '@angular/router';
import {LogsDialogComponent} from '../../report/logsDialog/logs-dialog.component';
import {UserService} from '../../../service/user.service';
import {ConfirmDialogComponent} from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import {Constants} from '../../../model/Constants';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';
import {PageMetaData} from '../../../shared/table/page-meta-data';
import {SpinnerComponent} from '../../../shared/component/spinner-component/spinner.component';
import {forkJoin} from 'rxjs';


@Component({
  selector: 'app-reports-in-progress-table',
  templateUrl: 'reports-in-progress-table.component.html',
  styleUrls: ['reports-in-progress-table.component.scss']
})
export class ReportsInProgressTableComponent extends AbstractComponent implements OnDestroy, OnInit {


  constructor(private rispoService: RispoService,
              private userService: UserService,
              public dialog: MatDialog,
              private router: Router,
              private route: ActivatedRoute
  ) {
    super();
  }

  public static errorDialogVisible: boolean;

  logger: Logger = LoggerFactory.getLogger('ReportsInProgressTableComponent');

  pageMetaData: PageMetaData;

  private reportsInProgress: Array<Group>;

  numberReportsInProgress = 0;

  fatalErrorMsg: String = '';

  dataSource = new MatTableDataSource<Group>();

  displayedColumns: any = [
    'kpo',
    'name',
    'status',
    'creationDate',
    'reportDate',
    'exposureView',
    'logs',
    'owner',
    'orgJed',
    'delete'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild('spinnerReportsInProgress') spinner: SpinnerComponent;
  private dialogRef: MatDialogRef<ConfirmDialogComponent>;

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;


    this.spinner.track([RispoService.CALL_TRACKING_TOKEN_REPORTS_IN_PROGRESS]);

    this.fetchReportsInProcess();

    // fetchReportsInProcess if is changed logged user
    let sub = this.userService.loggedUser.subscribe(value =>
      this.fetchReportsInProcess()
    );

    this.subscriptions.push(sub);


    sub = this.rispoService.fetchReportsInProcess.subscribe(() => {

      this.fetchReportsInProcess();

    });

    this.subscriptions.push(sub);

    sub = this.rispoService.reportsInProgressData.subscribe(responseData => {

      this.numberReportsInProgress = responseData.length;

      this.resetClientComponent();

    });

    this.subscriptions.push(sub);


  }

  open(id: number): void {
    // FacesContext.getCurrentInstance().getExternalContext().redirect('Edit.xhtml?id=' + id);
    // Relative navigation  to Edit.html

    this.router.navigate(['../edit', id], {relativeTo: this.route});

  }


  remove(group: Group): void {

    this.dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: 'Brisanje izvještaja',
          question: ' Jeste li sigurni da želite obrisati odabrani izvještaj?'
        },
        width: '25%'
      });

    this.dialogRef.afterClosed().subscribe(value => {

      const result: boolean = value;

      if (result) {

        this.removeGroup(group);

      }

    }, error1 => {

      this.log('Greška prilikom otvaranja dialoga za potvrdu brisanja grupe. Group id: ' + group.id + ' ERROR-> ' + JSON.stringify(error1));

    }, () => {

    });

  }

  private removeGroup(group: Group): void {

    this.rispoService.deleteGroup(group).subscribe(response => {

        if (response) {

          let groupArray = this.rispoService.reportsInProgressData.getValue();

          groupArray = groupArray.filter(obj => obj !== group);

          this.rispoService.setReportsInProgressTableData(groupArray);
          this.dataSource.data = groupArray;
          this.rispoService.fetchReportsInCreation.next();

          this.addMessage(Constants.REPORTS_DELETE.toString(), Constants.REPORTS_DELETE_SUCCESS.toString());

        } else {

          this.addMessage(Constants.REPORTS_DELETE.toString(), Constants.REPORTS_DELETE_SUCCESS.toString());

        }


      },
      error => {

        this.addMessage(Constants.REPORTS_DELETE.toString(), Constants.REPORTS_DELETE_ERROR.toString());


      });

  }

  showLogs(groupId: number): void {

    this.dialog.open(LogsDialogComponent,
      {
        data: {
          groupId: groupId
        }
      });

  }

  fetchReportsInProcess(): void {

    const timeRangeInMonths = 1;

    const date: Date = new Date();

    const uRaduIliGreske: Array<Group> = new Array<Group>();

    date.setMonth(date.getMonth() - timeRangeInMonths);

    /**
     *
     * Wait until all (ReportStatus.DENIED & ReportStatus.ERROR ) WS calls have been completed
     *
     */
    forkJoin(
      [
        this.getReportStatusDeniedAsPromise(date),
        this.getReportStatusErrorAsPromise(date)
      ]
    ).subscribe(([greskeDenied, greskeError]) => {

      this.log('COMPLETED StatusDENIED:  & COMPLETED StatusERROR:');


      if (greskeDenied !== null && greskeDenied.length !== 0) {
        greskeDenied.forEach(group => {
          if (group.owner === this.userService.getLoggedUserUser().username) {
            if (!ReportsInProgressTableComponent.errorDialogVisible) {

              ReportsInProgressTableComponent.errorDialogVisible = true;

              this.fatalErrorMsg = 'Greska! Nemate prava na izvjestaj za grupu ' + group.name;

              this.addMessage('GREŠKA', this.fatalErrorMsg.toString());

              this.rispoService.deleteGroup(group).subscribe(response => {

                  this.log('Obrisana grupa');

                }
              );
            }
          }
        });
      }

      if (greskeError !== null && greskeError.length !== 0) {
        greskeError.forEach(group => {
          if (group.owner === this.userService.getLoggedUserUser().username) {
            if (!ReportsInProgressTableComponent.errorDialogVisible) {

              ReportsInProgressTableComponent.errorDialogVisible = true;

              this.fatalErrorMsg = 'Greska kod dohvata izvještaja za grupu ' + group.name + '. Pokusajte ponovno!';

              this.addMessage('GREŠKA', this.fatalErrorMsg.toString());

              this.rispoService.deleteGroup(group).subscribe(response => {

                  this.log('Obrisana grupa');

                }
              );
            }
          }
        });
      }


      if (this.userService.getLoggedUserUser().checkSecurity && this.userService.getLoggedUserUser().orgJeds.length === 0) {
        this.log('USER DATA: ' + this.userService.getLoggedUserUser());
        this.reportsInProgress = uRaduIliGreske; // return uRaduIliGreske;
        this.rispoService.setReportsInProgressTableData(uRaduIliGreske);
        this.dataSource.data = uRaduIliGreske;
        this.numberReportsInProgress = uRaduIliGreske.length;

      } else {

        if (this.userService.getLoggedUserUser().checkSecurity) {
          const substringedOrgJedKor: Array<string> = new Array<string>();

          this.userService.getLoggedUserUser().orgJeds.forEach(orgJedWith8Chars => {
            substringedOrgJedKor.push(orgJedWith8Chars.substring(0, orgJedWith8Chars.length - 2));

          });

          this.rispoService.findByStatusAndOrganizationalUnits(ReportStatus.IN_PROGRESS.valueOf(), date, substringedOrgJedKor).subscribe(response => {
            this.reportsInProgress = response;
            this.rispoService.setReportsInProgressTableData(response);
            this.dataSource.data = response;
            this.numberReportsInProgress = response.length;
          });

        } else {

          this.rispoService.findByStatusAndDate(ReportStatus.IN_PROGRESS.valueOf(), date).subscribe(response => {
            this.reportsInProgress = response;
            this.rispoService.setReportsInProgressTableData(response);
            this.dataSource.data = response;
            this.numberReportsInProgress = response.length;

          });

        }


      }


    }, error1 => {

      this.logger.info('ERROR while calls  ->    myPromiseReportStatusDENIED()  myPromiseReportStatusERROR() ERROR: ' + error1);

    });


  }

  /**
   *            ReportStatus.DENIED
   */
  getReportStatusDeniedAsPromise(date: Date): Promise<Array<Group>> {

    let greskeDenied: Array<Group> = new Array<Group>();

    return new Promise<Array<Group>>((resolve) => {

      try {

        this.rispoService.findByStatusAndDate(ReportStatus.DENIED.valueOf(), date).subscribe(responseData => {
          // this.logger.info('findByStatusAndDate DENIED', responseData);
          greskeDenied = responseData;

          resolve(greskeDenied);
        }, err => {

          this.log('ERROR: findByStatusAndDate -> GREŠKE_DENIED' + err);
          throw new Error('ERROR: findByStatusAndDate -> GREŠKE_DENIED' + err);
        });


      } catch (e) {
        this.log('ERROR: findByStatusAndDate -> GREŠKE_DENIED' + e);
        throw new Error('ERROR: findByStatusAndDate -> GREŠKE_DENIED' + e);
      }

    });


  }

  /**
   *            ReportStatus.ERROR
   */
  getReportStatusErrorAsPromise(date: Date): Promise<Array<Group>> {

    let greskeError: Array<Group> = new Array<Group>();

    return new Promise<Array<Group>>((resolve) => {

      try {

        this.rispoService.findByStatusAndDate(ReportStatus.ERROR.valueOf(), date).subscribe(responseData => {

          // this.logger.info('findByStatusAndDate ERROR', responseData);

          greskeError = responseData;

          resolve(greskeError);
        }, err => {

          this.log('ERROR: findByStatusAndDate -> GREŠKE_ERROR' + err);
          throw new Error('ERROR: findByStatusAndDate -> GREŠKE_ERROR' + err);
        });


      } catch (e) {
        this.log('ERROR: findByStatusAndDate -> GREŠKE_ERROR' + e);
        throw new Error('ERROR: findByStatusAndDate -> GREŠKE_ERROR' + e);
      }

    });


  }

  fetchByClient(clientData: ClientData): void {
    this.rispoService.fetchByClient.next(clientData);
  }


  /**
   * Reset search values to blank strings and reload all table data
   */
  resetClientComponent(): void {

    this.paginator.pageIndex = 0;

  }


  /**
   * On every page change we set new PageMetaData object to
   * newPaginationData stream and fetch new client list data for current page.
   */
  onPageChange($event: any): void {

    this.pageMetaData = new PageMetaData();

    this.pageMetaData.offset = $event.pageIndex;

    this.pageMetaData.limit = $event.pageSize;

    this.rispoService.setNewPaginationReportsInProgressTable(this.pageMetaData);

  }


  ngOnDestroy(): void {

    super.ngOnDestroy();
    ReportsInProgressTableComponent.errorDialogVisible = false;

  }


}
