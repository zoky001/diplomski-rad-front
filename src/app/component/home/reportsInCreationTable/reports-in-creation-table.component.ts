import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatTableDataSource} from '@angular/material';
import {ClientData} from '../../../model/client-data';
import {RispoService} from '../../../service/rispo.service';
import {Group} from '../../../model/group';
import {ReportStatus} from '../../../model/report-status';
import {Constants} from '../../../model/Constants';
import {WorkingReportSearchFormComponent} from '../workingReportSearchForm/working-report-search-form.component';
import {ReportsInProgressTableComponent} from '../reportsInProgressTable/reports-in-progress-table.component';
import {UserService} from '../../../service/user.service';
import {ConfirmDialogComponent} from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';
import {forkJoin, interval, Subscription} from 'rxjs';
import {SpinnerComponent} from '../../../shared/component/spinner-component/spinner.component';

@Component({
  selector: 'app-reports-in-creation-table',
  templateUrl: 'reports-in-creation-table.component.html',
  styleUrls: ['reports-in-creation-table.component.scss']
})
export class ReportsInCreationTableComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('ReportsInCreationTableComponent');

  private reportsInCreation: Array<Group>;

  numberOfReportsInCreation: number;

  dataSource = new MatTableDataSource<Group>();

  displayedColumns: any = [
    'kpo',
    'name',
    'progress',
    'action'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild('spinner') spinner: SpinnerComponent;


  private logs: Array<String>;

  private fatalErrorMsg: string;

  private stopUpdating: boolean;


  private subscription: Subscription;
  private dialogRef: MatDialogRef<ConfirmDialogComponent>;


  constructor(private rispoService: RispoService,
              private userService: UserService,
              public dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;

    this.fetchReportsInCreation();

    // fetchReportsInProcess if is changed logged user
    const sub = this.userService.loggedUser.subscribe(value =>
      this.fetchReportsInCreation()
    );

    this.subscriptions.push(sub);


    const sub1 = this.rispoService.fetchReportsInCreation.subscribe(responseData => {

      this.fetchReportsInCreation();


    });

    this.subscriptions.push(sub1);

    this.refreshReportsAutomatically();


  }

  /**
   * Zove se sa klijenta svakih 5 sekundi tako dugo dok postoje izvještaji u
   * procesu kreiranja. Osvježava listu izvještaja u procesu kreiranja i u
   * radu (ako je potrebno)
   */
  refreshReportsAutomatically(): void {

    this.subscription = interval(5000).subscribe((v) => {

        if (!this.stopUpdating) {

          this.log('INTERVAL REFRESH:   ' + v);

          this.refreshReports();

        } else {

          if (this.subscription != null) {

            this.subscription.unsubscribe();

            this.log('INTERVAL REFRESH:   STOP' + v);

          }

        }

      }
    );
  }

  /**
   *
   *   ERROR DIALOG?????
   */
  refreshReports(): void {
    const sub = this.rispoService.findByOwnerAndStatus(this.userService.getLoggedUserUser().username, ReportStatus.CREATING)
      .subscribe(responseData => {

        this.logger.debug('findByOwnerAndStatus response', responseData);

        this.reportsInCreation = responseData;

        this.dataSource.data = responseData;

//      this.numberOfEntries = responseData.length;

        if (!ReportsInProgressTableComponent.errorDialogVisible) {


          const promiseList: Array<Promise<Array<string>>> = new Array<Promise<Array<string>>>();

          this.dataSource.data.forEach(group => {

            promiseList.push(this.rispoService.findLogsByGroup(group.id).toPromise());

          });


          /**
           *
           * Wait until all WS calls have been completed
           *
           */
          forkJoin(
            promiseList
          ).subscribe((response) => {

            this.logs = new Array<string>();
            response.forEach(data => {

              data.forEach(log => {
                this.logs.push(log);
              });

            });

            this.logger.info(this.logs);

            if (this.logs != null && this.logs.length > 0) {

              if (!ReportsInProgressTableComponent.errorDialogVisible) {

                this.fatalErrorMsg = 'Greska kod dohvata izvjestaja. Pokusajte ponovno!';
                // todo this.addMessage('GREŠKA', this.fatalErrorMsg);
              // todo obrisi  this.stopUpdatingReports();
              }
            }

          }, error1 => this.stopUpdatingReports());


        }


        if (this.isReportCreationDone()) {

          this.stopUpdatingReports();

        }

        if (this.isReportCreated() && !this.isSearchFormActive()) {

          this.updateReports();

        }

        if (this.isLastReportCreated() && !this.isSearchFormActive()) {

          this.updateReports();

        }


      }, error1 => {

        this.stopUpdatingReports();

        this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_FETCH_ERROR.toString());

      });

    this.subscriptions.push(sub);


  }

  private isLastReportCreated(): boolean {

    return this.dataSource.data.length === 0 &&
      this.dataSource.data.length !== this.numberOfReportsInCreation;

  }


  private isReportCreated(): boolean {

    return this.dataSource.data.length !== 0 &&
      this.dataSource.data.length !== this.numberOfReportsInCreation;

  }


  private stopUpdatingReports(): void {

    this.stopUpdating = true;

  }

  private isSearchFormActive(): boolean {

    return WorkingReportSearchFormComponent.searchActive;

  }

  private updateReports(): void {

    this.numberOfReportsInCreation = this.dataSource.data.length;

    this.rispoService.fetchReportsInProcess.next();

  }

  isReportCreationDone(): boolean {

    return this.dataSource.data.length === 0 &&
      this.dataSource.data.length === this.numberOfReportsInCreation;

  }

  fetchReportsInCreation(): void {

    const sub = this.rispoService.findByOwnerAndStatus(this.userService.getLoggedUserUser().username, ReportStatus.CREATING)
      .subscribe(responseData => {

          this.log('findByOwnerAndStatus response' + responseData);

          this.reportsInCreation = responseData;

          this.numberOfReportsInCreation = responseData.length;

          this.dataSource.data = responseData;

          //  this.numberOfEntries = responseData.length;
        },
        error1 => {
          this.log('fetchReportsInCreation -> findByOwnerAndStatus (ERROR): ' + error1);
        });

    this.subscriptions.push(sub);

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

          this.rispoService.fetchReportsInCreation.next();

        } else {

          this.addMessage(Constants.REPORTS_DELETE.toString(), Constants.REPORTS_DELETE_SUCCESS.toString());

        }


      },
      error => {

        this.addMessage(Constants.REPORTS_DELETE.toString(), Constants.REPORTS_DELETE_ERROR.toString());


      });

  }


  fetchByClient(clientData: ClientData): void {

    this.rispoService.fetchByClient.next(clientData);

  }

  ngOnDestroy(): void {

    super.ngOnDestroy();
    if (this.subscription !== undefined && this.subscription != null) {

      this.subscription.unsubscribe();
    }

  }


}
