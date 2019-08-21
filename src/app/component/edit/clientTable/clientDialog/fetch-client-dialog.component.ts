import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Constants} from '../../../../utilities/Constants';
import {CodebookService} from '../../../../service/codebook.service';
import {UserService} from '../../../../service/user.service';
import {RispoService} from '../../../../service/rispo.service';
import {Client} from '../../../../model/client';
import {Logger, LoggerFactory} from '../../../../core-module/service/logging/LoggerFactory';
import {AbstractComponent} from '../../../../shared-module/component/abstarctComponent/abstract-component';
import {MessageBusService} from '../../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../../utilities/ReceiverID';


@Component({
  selector: 'app-fetch-client-dialog',
  styles: [`
    button:hover {
      box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
    }

    ,
    .numberParts {
      width: 100px;
    }

    ::ng-deep .mat-card-subtitle:not(:first-child),
    .mat-card-title:not(:first-child) {
      margin-top: 0px;
      background: white;
    }
  `],
  templateUrl: 'fetch-client-dialog.component.html'
})
export class FetchClientDialogComponent extends AbstractComponent implements OnInit, OnDestroy {

  logger: Logger = LoggerFactory.getLogger('FetchClientDialogComponent');


  form: FormGroup;

  clientFetchTypeControl: FormControl;
  clientFetchType = 1;


  clientFetchValueControl: FormControl;
  clientFetchValue: string;

  menuItems: any = [
    {'label': 'Matični broj', 'value': 10},
    {'label': 'OIB', 'value': 4},
    {'label': 'Br. registra', 'value': 0}
  ];


  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    public codebookService: CodebookService,
    public dialogRef: MatDialogRef<FetchClientDialogComponent>,
    public rispoService: RispoService,
    private messageBusService: MessageBusService) {
    super(messageBusService);
  }

  ngOnInit(): void {

    this.clearRegNumber();


    if (!this.form) {

      this.clientFetchType = 10;  // 10 - Matični broj

      this.form = new FormGroup({
        clientFetchTypeControl: new FormControl(this.clientFetchType, [Validators.required]),
        clientFetchValueControl: new FormControl(this.clientFetchValue, [Validators.required])
      });

    }


    // value changes listeners
    let sub = this.form.get('clientFetchTypeControl').valueChanges.subscribe((value) => {
      this.clientFetchType = value;
    });

    this.subscriptions.push(sub);

    // value changes listeners
    sub = this.form.get('clientFetchValueControl').valueChanges.subscribe((value) => {
      this.clientFetchValue = value;
    });

    this.subscriptions.push(sub);


  }


  /**
   * Method that is called when user presses enter on form.
   */
  fetch(): void {
    // validate all input fields
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach(field => { // {1}
        const control = this.form.get(field);            // {2}
        control.markAsTouched({onlySelf: true});       // {3}
      });
      return;
    }

    if (this.formValid) {
      this.log('Save if valid!!');
      this.fetchPrivate().then(value => {
        this.dialogRef.close();
      }, reason => {
        this.addMessage('Dohvat podataka clan', 'Greska tijekom dohvata clana');
        this.log('Dohvat podataka clan - Greska tijekom dohvata clana - ' + reason);
      });
    }
  }

  private fetchPrivate(): Promise<void> {

    const message = 'Clan vec postoji u grupi';


    return new Promise<void>((resolve, reject) => {
      try {


        // **************************************************************************************************
        //                                                                                    fetchPrivate
        // **************************************************************************************************

        // provjera dali je već u grupi
        for (let i = 0; i < this.rispoService.getReportsDetailsGroup().members.length; i++) {
          const c: Client = this.rispoService.getReportsDetailsGroup().members[i];

          if (this.clientFetchType === 10) {

            if (c.mb !== undefined && c.mb !== null && c.smb !== undefined && c.smb !== null && (c.mb + c.smb) === this.clientFetchValue) {

              this.addMessage('Dodavanje clana', message);
              resolve();
              return;
            }
          } else if (this.clientFetchType === 4) {

            if (c.oib !== undefined && c.oib !== null && c.oib === this.clientFetchValue) {

              this.addMessage('Dodavanje clana', message);
              resolve();
              return;


            }

          } else if (this.clientFetchType === 0) {

            if (c.registerNumber !== undefined && c.registerNumber !== null && c.registerNumber === this.clientFetchValue) {

              this.addMessage('Dodavanje clana', message);
              resolve();
              return;


            }

          }

        }
        // dohvat br registra ako je dohvat po OIB ili MB
        this.fetchRegisterNumberByOIBorMB().then(value => {

          let searchValue = '';
          if (value.success) {
            searchValue = value.regNum;

            // todo neka sprobavam this.rispoService.fetchClient.next({'searchValue': searchValue});

            this.sendMessage(ReceiverID.RECEIVER_ID_FETCH_CLIENT, {'searchValue': searchValue});
            resolve();

          } else {
            this.addMessage('Dodavanje clana', value.message);
            resolve();
          }

        }, reason => {
          reject(reason);
        });


      } catch (e) {

        this.log('Error in fetchPrivate -> ' + e);
        reject(e);

      }

    });


  }


  /**
   * dohvat br registra ako je dohvat po OIB ili MB
   */
  private fetchRegisterNumberByOIBorMB(): Promise<{ success: boolean, regNum: string, message: string }> {


    return new Promise<{ success: boolean, regNum: string, message: string }>((resolve, reject) => {

      try {

        let searchValue: string;

        if (this.clientFetchType === 10) {
          this.rispoService.getClientData(Constants.SEARCH_TYPE_MB, this.clientFetchValue).subscribe(clientData => {
            if (clientData !== null && clientData.status === 0 && clientData.data.length >= 1) {

              searchValue = clientData.data[0].registerNumber;
              resolve({'success': true, 'regNum': searchValue, 'message': ''});
            } else {
              resolve({'success': false, 'regNum': '', 'message': 'Greska dohvata clana'});
            }

          }, error1 => {
            reject(error1);
          });

        } else if (this.clientFetchType === 4) {

          this.rispoService.getClientData(Constants.SEARCH_TYPE_OIB, this.clientFetchValue).subscribe(clientData => {
            if (clientData !== null && clientData.status === 0 && clientData.data.length >= 1) {

              searchValue = clientData.data[0].registerNumber;
              resolve({'success': true, 'regNum': searchValue, 'message': ''});
            } else {
              resolve({'success': false, 'regNum': '', 'message': 'Greska dohvata clana'});
            }

          }, error1 => {
            reject(error1);
          });

        } else {

          resolve({'success': true, 'regNum': this.clientFetchValue, 'message': ''});

        }

      } catch (e) {
        this.log('ERROR: fetchRegisterNumberByOIBorMB -> ' + e);
        reject(e);
      }

    });


  }

  /**
   * Checks if form is valid before searching data.
   */
  get formValid(): boolean {
    return this.form.valid;
  }

  private clearRegNumber(): void {

    this.clientFetchValue = '';
    this.clientFetchType = 1;

  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


}
