import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatTableDataSource} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {MultilanguageEntriesDialogComponent} from './multilanguage-entries-dialog.component';
import {CodebookEntry} from '../../../model/codebook-entry';
import {ConfirmDialogComponent} from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import {Constants} from '../../../model/Constants';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';
import {SpinnerComponent} from '../../../shared/component/spinner-component/spinner.component';

@Component({
  selector: 'app-multilanguage-entries',
  templateUrl: 'multilanguage-entries.component.html',
  styleUrls: ['multilanguage-entries.component.scss']
})
export class MultilanguageEntriesComponent extends AbstractComponent implements OnInit, OnDestroy {
  /**
   * View scope bean za ažuriranje šifrarnika koji se koriste u padajućim izbornicima (src/main/webapp/views/codebooks/codebook*.xhtml).
   */

  logger: Logger = LoggerFactory.getLogger('MultilanguageEntriesComponent');

  numberOfEntries: number;

  dataSource = new MatTableDataSource<CodebookEntry>();


  displayedColumns: any = [
    'type',
    'name',
    'action'
  ];


  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild('spinner') spinner: SpinnerComponent;


  private dialogRef: any;

  constructor(private rispoService: RispoService,
              public dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;

    this.spinner.track([RispoService.CALL_TRACKING_TOKEN_CODEBOOK]);


    this.loadEntries();


    const sub1 = this.rispoService.refreshCodebookData.subscribe(() => {

      this.refresh();

    });

    this.subscriptions.push(sub1);

  }

  refresh(): void {

    this.loadEntries();

  }

  private loadEntries(): void {


    const sub = this.rispoService.getCodebookEntries().subscribe(responseData => {

      this.dataSource.data = responseData;

      this.numberOfEntries = responseData.length;

    }, error1 => {

      this.log('getCodebookEntries() ERROR: ' + error1);

    });

    this.subscriptions.push(sub);

  }


  delete(data: CodebookEntry): void {

    this.dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: 'Brisanje šifrarničkog unosa',
          question: 'Jeste li sigurni da želite obrisati odabrani šifrarnički unos?'
        },
        width: '25%'
      });

    this.dialogRef.afterClosed().subscribe(value => {

      const result: boolean = value;

      if (result) {

        this.remove(data);

      }

    }, error1 => {

      this.log(
        'Greška prilikom otvaranja dialoga za potvrdu brisanja  sifrarnika. Klijent id: ' + data.id + ' ERROR-> ' + JSON.stringify(error1));

    }, () => {

    });


  }

  remove(codebookEntry: CodebookEntry): void {


    try {
      this.rispoService.deleteCodebookEntry(codebookEntry).subscribe(response => {

          this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_SUCCESS.toString());

          this.rispoService.refreshCodebookData.next();

        },
        error => {
          this.rispoService.refreshCodebookData.next();

          this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_ERROR.toString());


        });
    } catch (e) {

      this.log('CodebookEntry ERROR:  ' + JSON.stringify(e));

      this.rispoService.refreshCodebookData.next();

      this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_ERROR.toString());

    }


  }


  edit(data: CodebookEntry): void {

    this.dialog.open(MultilanguageEntriesDialogComponent,
      {
        data: {
          codebookEntry: data,
          isEditMode: true
        }
      });

  }

  add(): void {

    this.dialog.open(MultilanguageEntriesDialogComponent,
      {
        data: {}
      });

  }

}
