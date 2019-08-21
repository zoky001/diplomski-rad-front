import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatTableDataSource} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {TypeOfCreditEntry} from '../../../model/type-of-credit-entry';
import {TypeOfCreditDialogComponent} from './type-of-credit-dialog.component';
import {ConfirmDialogComponent} from '../../../shared-module/component/confirm-dialog/confirm-dialog.component';
import {Constants} from '../../../utilities/Constants';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {SpinnerComponent} from '../../../shared-module/component/spinner-component/spinner.component';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';


@Component({
  selector: 'app-type-of-credit',
  templateUrl: 'type-of-credit.component.html',
  styleUrls: ['type-of-credit.component.scss']
})
export class TypeOfCreditComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('TypeOfCreditComponent');

  numberOfEntries: number;

  dataSource = new MatTableDataSource<TypeOfCreditEntry>();

  displayedColumns: any = [
    'aplikacija',
    'vrstaOznakaPosla',
    'kategorija',
    'sifraNamjene',
    'nacinKoristenja',
    'oznakaVrstePlasmana',
    'poredak',
    'action'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private dialogRef: MatDialogRef<ConfirmDialogComponent>;


  constructor(private rispoService: RispoService,
              public dialog: MatDialog,
              private messageBusService: MessageBusService) {
    super(messageBusService);
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;

    this.loadEntries();

    const sub1 = this.getMessage(ReceiverID.RECEIVER_ID_REFRESH_TYPE_OF_CREDIT_DATA).subscribe(() => {

      this.refresh();

    });

    this.subscriptions.push(sub1);


  }

  refresh(): void {

    this.loadEntries();

  }

  loadEntries(): void {

    const sub = this.rispoService.getTypeOfCreditEntries().subscribe(responseData => {

      this.dataSource.data = responseData;

      this.numberOfEntries = responseData.length;

    }, error1 => {

      this.log('getTypeOfCreditEntries() ERROR: ' + error1);

    });

    this.subscriptions.push(sub);


  }


  delete(data: TypeOfCreditEntry): void {

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

  remove(codebookEntry: TypeOfCreditEntry): void {
    try {
      this.rispoService.deleteTypeOfCreditEntry(codebookEntry).subscribe(response => {


          this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_SUCCESS.toString());


          // this.rispoService.refreshTypeOfCreditData.next();
          this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_TYPE_OF_CREDIT_DATA, true);

        },
        error => {
          // this.rispoService.refreshTypeOfCreditData.next();
          this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_TYPE_OF_CREDIT_DATA, true);

          this.log('TYPE OF CREDIT ERROR:  ' + JSON.stringify(error));
          this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_ERROR.toString());


        });
    } catch (e) {
      // this.rispoService.refreshTypeOfCreditData.next();
      this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_TYPE_OF_CREDIT_DATA, true);

      this.log('TYPE OF CREDIT ERROR:  ' + JSON.stringify(e));
      this.addMessage(Constants.CODEBOOK_REMOVE.toString(), Constants.CODEBOOK_REMOVE_ERROR.toString());

    }


  }


  edit(data: TypeOfCreditEntry): void {

    this.dialog.open(TypeOfCreditDialogComponent,
      {
        data: {
          typeOfCreditEntry: data,
          isEditMode: true
        }
      });

  }

  add(): void {

    this.dialog.open(TypeOfCreditDialogComponent,
      {
        data: {}
      });

  }


}
