import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatTableDataSource} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {PlasmanTypeDialogComponent} from './plasman-type-dialog.component';
import {PlasmanTypeEntry} from '../../../model/plasman-type-entry';
import {ConfirmDialogComponent} from '../../../shared-module/component/confirm-dialog/confirm-dialog.component';
import {Constants} from '../../../utilities/Constants';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {SpinnerComponent} from '../../../shared-module/component/spinner-component/spinner.component';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';

@Component({
  selector: 'app-plasman-type',
  templateUrl: 'plasman-type.component.html',
  styleUrls: ['plasman-type.component.scss']
})
export class PlasmanTypeComponent extends AbstractComponent implements OnInit {
  /**
   *  * View scoped bean za ažuriranje PlasmanType šifrarnika.
   */

  logger: Logger = LoggerFactory.getLogger('PlasmanTypeComponent');

  numberOfEntries: number;


  dataSource = new MatTableDataSource<PlasmanTypeEntry>();

  displayedColumns: any = [
    'aplikacija',
    'oznakaLimita',
    'sifraNamjene',
    'tip',
    'action'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private dialogRef: any;


  constructor(private rispoService: RispoService,
              public dialog: MatDialog,
              private messageBusService: MessageBusService) {
    super(messageBusService);
  }

  ngOnInit(): void {

    this.dataSource.paginator = this.paginator;

    this.loadEntries();

    const sub1 = this.getMessage(ReceiverID.RECEIVER_ID_REFRESH_PLACEMENT_TYPE_DATA).subscribe(() => {

      this.refresh();

    });

    this.subscriptions.push(sub1);

  }

  refresh(): void {

    this.loadEntries();

  }

  private loadEntries(): void {


    const sub = this.rispoService.getPlacementTypeEntries().subscribe(responseData => {

      this.dataSource.data = responseData;

      this.numberOfEntries = responseData.length;

    }, error1 => {

      this.log('getPlacementTypeEntries() ERROR: ' + error1);

    });

    this.subscriptions.push(sub);

  }


  delete(data: PlasmanTypeEntry): void {

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

      this.log('Greška prilikom otvaranja dialoga za potvrdu brisanja  sifrarnika. Klijent id: '
        + data.id + ' ERROR-> ' + JSON.stringify(error1));

    }, () => {

    });


  }

  private remove(codebookEntry: PlasmanTypeEntry): void {


    try {
      this.rispoService.deletePlacementTypeEntry(codebookEntry).subscribe(response => {

          this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_SUCCESS.toString());

          // this.rispoService.refreshPlacementTypeData.next();
          this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_PLACEMENT_TYPE_DATA, true);

        },
        error => {
          // this.rispoService.refreshPlacementTypeData.next();
          this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_PLACEMENT_TYPE_DATA, true);

          this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_ERROR.toString());

        });
    } catch (e) {
      this.log('PlasmanType ERROR:  ' + JSON.stringify(e));

      // this.rispoService.refreshPlacementTypeData.next();
      this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_PLACEMENT_TYPE_DATA, true);

      this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_ERROR.toString());

    }
  }


  edit(data: PlasmanTypeEntry): void {

    this.dialog.open(PlasmanTypeDialogComponent,
      {
        data: {
          plasmanTypeEntry: data,
          isEditMode: true
        }
      });

  }

  add(): void {

    this.dialog.open(PlasmanTypeDialogComponent,
      {
        data: {}
      });

  }

}
