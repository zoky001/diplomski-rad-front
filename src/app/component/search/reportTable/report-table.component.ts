import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatTableDataSource} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {Group} from '../../../model/group';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmDialogComponent} from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import {Constants} from '../../../model/Constants';
import {LogsDialogComponent} from '../../report/logsDialog/logs-dialog.component';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {GeneralService} from '../../../service/general-service';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';


@Component({
  selector: 'app-report-table',
  templateUrl: 'report-table.component.html',
  styleUrls: ['report-table.component.scss']
})
export class ReportTableComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('ReportTableComponent');

  numberReportsInProgress = 0;

  errorDialogVisible = false;

  fatalErrorMsg: String = '';

  dataSource = new MatTableDataSource<Group>();

  displayedColumns: any = [
    'kpo',
    'name',
    'status',
    'creationDate',
    'owner',
    'orgJed',
    'delete'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  private dialogRef: MatDialogRef<ConfirmDialogComponent>;


  constructor(private rispoService: RispoService,
              public dialog: MatDialog,
              private router: Router,
              private route: ActivatedRoute,
              public generalService: GeneralService) {
    super();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;

    const sub = this.generalService.getMessage().subscribe(value => {
      if (value.receiverId === Constants.RECEIVER_ID_REPORT_TABLE) {
        this.dataSource.data = value.data;
        this.numberReportsInProgress = value.data.length;
      }
    }, error1 => {

    });

    this.subscriptions.push(sub);

  }


  open(id: number): void {
    // FacesContext.getCurrentInstance().getExternalContext().redirect('Edit.xhtml?id=' + id);
    // Relative navigation  to Edit.html
    // this.log(column);
    this.router.navigate(['../edit', id], {relativeTo: this.route});

  }


  remove(group: Group): void {

    this.dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: 'Brisanje izvještaja',
          question: 'Jeste li sigurni da želite obrisati odabrani izvještaj?'
        },
        width: '25%'
      });

    this.dialogRef.afterClosed().subscribe(value => {

      const result: boolean = value;

      if (result) {

        this.deleteGroup(group);

      }

    }, error1 => {

      this.log('Greška prilikom otvaranja dialoga za potvrdu brisanja grupe. Group id: ' + group.id + ' ERROR-> ' + JSON.stringify(error1));

    }, () => {

    });

  }

  private deleteGroup(group: Group): void {

    this.rispoService.deleteGroup(group).subscribe(response => {

        if (response) {

          let groupArray = this.dataSource.data;

          groupArray = groupArray.filter(obj => obj !== group);

          this.addMessage(Constants.REPORTS_DELETE.toString(), Constants.REPORTS_DELETE_SUCCESS.toString());

          this.dataSource.data = groupArray;

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


}
