import {Component, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {OnInit, OnDestroy} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Validators} from '@angular/forms';
import {RispoService} from '../../../../service/rispo.service';
import {Client} from '../../../../model/client';
import {Constants} from '../../../../utilities/Constants';
import {CodebookService} from '../../../../service/codebook.service';
import {CodebookEntry} from '../../../../model/codebook-entry';
import {UserService} from '../../../../service/user.service';
import {Group, LoadGroupDataStatus} from '../../../../model/group';
import {AbstractComponent} from '../../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../../core-module/service/logging/LoggerFactory';
import {forkJoin, Subscription} from 'rxjs';
import {SpinnerComponent} from '../../../../shared-module/component/spinner-component/spinner.component';
import {MessageBusService} from '../../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../../utilities/ReceiverID';


@Component({
  selector: 'app-client-dialog',
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
  templateUrl: 'client-dialog.component.html'
})
export class ClientDialogComponent extends AbstractComponent implements OnInit, OnDestroy {

  logger: Logger = LoggerFactory.getLogger('ClientDialogComponent');


  public client: Client;


  form: FormGroup;

  mbControl: FormControl;
  mbValue: any;

  smbControl: FormControl;
  smbValue: any;

  borrowerControl: FormControl;
  borrowerValue: any;

  sndgControl: FormControl;
  sndgValue: any;

  countryControl: FormControl;
  countryValue: any;

  intRatingControl: FormControl;
  intRatingValue: any;

  pdControl: FormControl;
  pdValue: any;

  ratingModelControl: FormControl;
  ratingModelValue: any;

  financialsEnclosedControl: FormControl;
  financialsEnclosedValue: any;

  industryControl: FormControl;
  industryValue: any;

  ownershipControl: FormControl;
  ownershipValue: any;

  ratingRelationControl: FormControl;
  ratingRelationValue: any;


  private intRatings: Array<CodebookEntry> = new Array<CodebookEntry>();
  private ratingModels: Array<CodebookEntry> = new Array<CodebookEntry>();
  private ratingRelation: Array<CodebookEntry> = new Array<CodebookEntry>();

  private loadGroupDataRef: Subscription;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public userService: UserService,
              private rispoService: RispoService,
              public codebookService: CodebookService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ClientDialogComponent>,
              private messageBusService: MessageBusService) {
    super(messageBusService);

    if (data.client !== undefined) {

      this.client = (Object.assign({}, data.client)) as Client; // clone the object

    }


  }

  ngOnInit(): void {

    let sub11 = this.codebookService.getIntRatings().subscribe(response => {
      const values: Array<CodebookEntry> = Array.from(response.values());
      this.intRatings = values;
    });
    this.subscriptions.push(sub11);

    sub11 = this.codebookService.getRatingModels().subscribe(response => {
      const values: Array<CodebookEntry> = Array.from(response.values());
      this.ratingModels = values;
    });
    this.subscriptions.push(sub11);


    sub11 = this.codebookService.getRatingRelation().subscribe(response => {
      const values: Array<CodebookEntry> = Array.from(response.values());
      this.ratingRelation = values;
    });
    this.subscriptions.push(sub11);


    if (!this.form) {
      this.form = new FormGroup({
        mbControl: new FormControl(this.client.mb, [Validators.pattern(Constants.MB_REGEX)]),
        smbControl: new FormControl(this.client.smb, [Validators.pattern(Constants.SMB_REGEX)]),
        borrowerControl: new FormControl(this.client.borrower, [Validators.required]),
        sndgControl: new FormControl(this.client.sndg),
        countryControl: new FormControl(this.client.country, [Validators.required]),
        intRatingControl:
          new FormControl(this.client.intRating !== null && this.client.intRating !== undefined ? this.client.intRating.id : ''),
        pdControl: new FormControl(this.client.pd),
        ratingModelControl:
          new FormControl(this.client.ratingModel !== null && this.client.ratingModel !== undefined ? this.client.ratingModel.id : ''),
        financialsEnclosedControl: new FormControl(this.client.financialsEnclosed)
      });

      if (this.client.grouped) { // some fields are required or not
        this.form.addControl('industryControl', new FormControl(this.client.industry));
        this.form.addControl('ownershipControl', new FormControl(this.client.ownerName, [Validators.required]));
        this.form.addControl(
          'ratingRelationControl',
          new FormControl(this.client.ratingRelation !== null && this.client.ratingRelation !== undefined ? this.client.ratingRelation.id : ''));
      } else {
        this.form.addControl('industryControl', new FormControl(this.client.industry, [Validators.required]));
        this.form.addControl('ownershipControl', new FormControl(this.client.ownerName, [Validators.required]));
        this.form.addControl(
          'ratingRelationControl',
          new FormControl(this.client.ratingRelation !== null && this.client.ratingRelation !== undefined ? this.client.ratingRelation.id : ''));
      }

    }


    // value changes listeners
    let sub = this.form.get('borrowerControl').valueChanges.subscribe((value) => {
      this.borrowerValue = value;
      this.client.borrower = value;
    });
    this.subscriptions.push(sub);

    // value changes listeners
    sub = this.form.get('smbControl').valueChanges.subscribe((value) => {
      this.smbValue = value;
      this.client.smb = value;
    });
    this.subscriptions.push(sub);

    // value changes listeners
    sub = this.form.get('mbControl').valueChanges.subscribe((value) => {
      this.mbValue = value;
      this.client.mb = value;
    });
    this.subscriptions.push(sub);


    sub = this.form.get('sndgControl').valueChanges.subscribe((value) => {
      this.sndgValue = value;
      this.client.sndg = value;
    });
    this.subscriptions.push(sub);


    const sub1 = this.form.get('countryControl').valueChanges.subscribe((value) => {
      this.countryValue = value;
      this.client.country = value;
    });
    this.subscriptions.push(sub1);

    const sub2 = this.form.get('intRatingControl').valueChanges.subscribe((value) => {
      this.intRatingValue = value;
      this.client.intRating = this.getIntRatings().filter(value1 => value1.id === value)[0];
    });
    this.subscriptions.push(sub2);

    const sub3 = this.form.get('pdControl').valueChanges.subscribe((value) => {
      this.pdValue = value;
      this.client.pd = value;
    });
    this.subscriptions.push(sub3);

    const sub4 = this.form.get('ratingModelControl').valueChanges.subscribe((value) => {
      this.ratingModelValue = value;
      this.client.ratingModel = this.getRatingModels().filter(value1 => value1.id === value)[0];
    });
    this.subscriptions.push(sub4);

    const sub5 = this.form.get('financialsEnclosedControl').valueChanges.subscribe((value) => {
      this.financialsEnclosedValue = value;
      this.client.financialsEnclosed = value;
    });
    this.subscriptions.push(sub5);

    const sub6 = this.form.get('industryControl').valueChanges.subscribe((value) => {
      this.industryValue = value;
      this.client.industry = value;
    });

    this.subscriptions.push(sub6);

    const sub7 = this.form.get('ownershipControl').valueChanges.subscribe((value) => {
      this.ownershipValue = value;
      this.client.ownerName = value;
    });
    this.subscriptions.push(sub7);


    const sub8 = this.form.get('ratingRelationControl').valueChanges.subscribe((value) => {
      this.ratingRelationValue = value;
      this.client.ratingRelation = this.getRatingRelation().filter(value1 => value1.id === value)[0];
    });
    this.subscriptions.push(sub8);


  }


  /**
   * Method that is called when user presses enter on form.
   */
  save(client: Client): void {
    // validate all input fields
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach(field => { // {1}
        const control = this.form.get(field);            // {2}
        control.markAsTouched({onlySelf: true});       // {3}
      });
      return;
    }

    if (this.form.valid) {
      this.log('Save if valid!!');
      this.savePrivate(client);
    }
  }

  private savePrivate(client: Client): void {
    try {

      if (client.id === null || client.id === undefined) {
        // ***********************************************************************************************
        //                                                                                    CLIENT SAVE
        // ***********************************************************************************************

        this.rispoService.clientSave(client).subscribe(responseClient => {

            const group: Group = this.rispoService.getReportsDetailsGroup();
            group.members.push(responseClient);
            group.refreshIndexes();
            this.rispoService.setReportsDetailsGroup(group);
            this.dialogRef.close();

          },
          error => {

            this.addMessage(Constants.CLIENT_SAVE.toString(), Constants.CLIENT_SAVE_ERROR.toString());

          }, () => {


            this.loadGroupDataRef = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
              if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
                this.loadGroupDataRef.unsubscribe();
                this.addMessage(Constants.CLIENT_ADD.toString(), Constants.CLIENT_ADD_SUCCESS.toString());

              }
            }, error1 => {
              this.loadGroupDataRef.unsubscribe();
            });


            this.changeOwnerIfDifferent().then(value => {
              // this.rispoService.loadGroupData.next();

              this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA, {
                'id': this.rispoService.getReportsDetailsGroup().id.toString(),
                'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
              });

            });

          });


      } else {
        // *****************************************************************************************************
        //                                                                                    CLIENT UPDATE
        // *****************************************************************************************************
        this.rispoService.clientSave(client).subscribe(responseClient => {


          },
          error => {

            this.addMessage(Constants.CLIENT_SAVE.toString(), Constants.CLIENT_SAVE_ERROR.toString());

          }, () => {

            this.loadGroupDataRef = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
              if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
                this.loadGroupDataRef.unsubscribe();
                this.dialogRef.close();
                this.addMessage(Constants.CLIENT_UPDATE.toString(), Constants.CLIENT_UPDATE_SUCCESS.toString());

              }
            }, error1 => {
              this.loadGroupDataRef.unsubscribe();
            });

            this.changeOwnerIfDifferent().then(value => {
              // this.rispoService.loadGroupData.next();
              this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA, {
                'id': this.rispoService.getReportsDetailsGroup().id.toString(),
                'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA
              });

            });


          });

      }

    } catch (e) {

      this.log('Error in savePrivate -> ' + e);
      this.addMessage(Constants.CLIENT_SAVE.toString(), Constants.CLIENT_SAVE_ERROR.toString());

    }


  }

  /**
   * Grupiranje klijenata - dobivamo novog klijenta čiji su podaci rezultata
   * spajanja grupiranih podataka i ručne nadopune korisnika. Spremamo ga. Svi
   * klijenti na temelju kojih je kreiran novi grupirani klijent dobivaju id
   * grupiranog klijenta (trenutnog). Također svi plasmani od svih klijenata
   * koji su grupirani također dobivaju oznaku grupiranog klijenta. Oznake
   * grupiranog klijenta služe za funkcionalnost odgrupiravanja.
   *
   * @param client
   *            novo kreirani 'grupirani' klijent
   */
  group(client: Client): void {
    // validate all input fields
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach(field => { // {1}
        const control = this.form.get(field);            // {2}
        control.markAsTouched({onlySelf: true});       // {3}
      });
      return;
    }

    if (this.form.valid) {
      this.log('Group if valid!!');
      this.groupPrivate(client);
    }
  }

  private groupPrivate(client: Client): void {
    const selectedClients: Array<Client> = new Array<Client>();

    this.rispoService.getReportsDetailsGroup().members.forEach(c => {
      if (c.selected) {
        client.exposures.push(...c.exposures);
        client.total.add(c.total);
        selectedClients.push(c);
      }

    });


    try {

      this.rispoService.clientSave(client).subscribe(responseClient => {

          // begin

          selectedClients.forEach(c => {
            c.groupedClientId = responseClient.id;
          });


          const promise2 = this.rispoService.clientSaveArray(selectedClients);


          client.exposures.forEach(e => {
            e.groupedClientId = responseClient.id;

          });

          const promise3 = this.rispoService.exposureSaveArray(client.exposures);


          forkJoin(
            [
              promise2,
              promise3
            ]
          ).subscribe((response) => {

            this.logger.info('response group client: response: ' + response);


            //   changeOwnerIfDifferent();
            //   loadGroupData(group.getId().toString(), false);
            this.changeOwnerIfDifferent().then(value => {


              this.loadGroupDataRef = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
                if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
                  this.loadGroupDataRef.unsubscribe();
                  this.dialogRef.close();
                  this.addMessage(Constants.CLIENT_GROUP.toString(), Constants.CLIENT_GROUP_SUCCESS.toString());

                }
              }, error1 => {
                this.loadGroupDataRef.unsubscribe();
              });


              // this.rispoService.loadGroupData.next();

              this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
                {'id': this.rispoService.getReportsDetailsGroup().id.toString(), 'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA}
              );


            }, reason => {
              throw new Error(reason);
            });


          }, (error) => {

            this.logger.info('groupPrivate  Observable.forkJoin ERROR: ' + error);
            throw new Error(error.toString());

          }, () => {
            this.logger.info('response group client: complete: ');

          });


          // end

        },
        error => {
          this.addMessage(Constants.CLIENT_GROUP.toString(), Constants.CLIENT_GROUP_ERROR.toString());


        });


    } catch (e) {
      this.log('Error in groupPrivate -> ' + e);
      this.addMessage(Constants.CLIENT_GROUP.toString(), Constants.CLIENT_GROUP_ERROR.toString());

    }


  }

  private changeOwnerIfDifferent(): Promise<boolean> {


    return new Promise<boolean>((resolve, reject) => {

      try {
        if (this.userService.getLoggedUserUser().username !== this.rispoService.getReportsDetailsGroup().owner) {
          this.rispoService.updateGroupOwner(this.rispoService.getReportsDetailsGroup().id, this.userService.getLoggedUserUser().username)
            .subscribe(value => {

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


  getIntRatings(): Array<CodebookEntry> {
    return this.intRatings;
  }

  getRatingModels(): Array<CodebookEntry> {
    return this.ratingModels;
  }

  getRatingRelation(): Array<CodebookEntry> {
    return this.ratingRelation;
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.loadGroupDataRef) {
      this.loadGroupDataRef.unsubscribe();
    }
  }


}
