import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {Constants} from '../../../utilities/Constants';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CodebookEntry} from '../../../model/codebook-entry';
import {Codebooks} from '../../../model/codebooks';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';


@Component({
  selector: 'app-confirm-dialog',
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
  templateUrl: 'multilanguage-entries-dialog.component.html'
})
export class MultilanguageEntriesDialogComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('MultilanguageEntriesDialogComponent');


  private codebookEntry: CodebookEntry;

  codebooks: Codebooks[];


  form: FormGroup;

  typeControl: FormControl;
  typeValue: String;
  typeValid = false;

  nameControl: FormControl;
  nameValue: String;
  nameValid = false;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private rispoService: RispoService,
              public dialogRef: MatDialogRef<MultilanguageEntriesDialogComponent>,
              private messageBusService: MessageBusService) {
    super(messageBusService);
    this.codebookEntry = new CodebookEntry();
    this.codebookEntry.type = Codebooks.INT_RATING;


    if (data.codebookEntry !== undefined) {

      // this.codebookEntry = data.codebookEntry.clone();
      this.codebookEntry = Object.assign({}, data.codebookEntry);

      if (data.codebookEntry.type === 'INT_RATING') {
        this.codebookEntry.type = Codebooks.INT_RATING;
      }

      if (data.codebookEntry.type === 'TAKER') {
        this.codebookEntry.type = Codebooks.TAKER;
      }

      if (data.codebookEntry.type === 'RISK_CLASS') {
        this.codebookEntry.type = Codebooks.RISK_CLASS;
      }

      if (data.codebookEntry.type === 'TYPE') {
        this.codebookEntry.type = Codebooks.TYPE;
      }

      if (data.codebookEntry.type === 'RATING_RELATION') {
        this.codebookEntry.type = Codebooks.RATING_RELATION;
      }

      if (data.codebookEntry.type === 'RATING_MODEL') {
        this.codebookEntry.type = Codebooks.RATING_MODEL;
      }

    }

  }

  ngOnInit(): void {

    this.codebooks = Constants.CODEBOOKS;


    if (!this.form) {
      this.form = new FormGroup({
        typeControl: new FormControl(this.codebookEntry.type, []),
        nameControl: new FormControl(this.codebookEntry.name, [Validators.required])
      });

    }


    // value changes listeners
    const sub = this.form.get('typeControl').valueChanges.subscribe((value) => {
      this.typeValue = value;
      this.codebookEntry.type = value;
      this.typeValid = value;
    });
    this.subscriptions.push(sub);


    const sub1 = this.form.get('nameControl').valueChanges.subscribe((value) => {
      this.nameValue = value;
      this.codebookEntry.name = value;
      this.nameValid = value;
    });
    this.subscriptions.push(sub1);

  }


  /**
   * Method that is called when user presses enter on form.
   */
  submitFormIfValid(): void {
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach(field => { // { 1 }
        const control = this.form.get(field);            // { 2 }
        control.markAsTouched({onlySelf: true});       // { 3 }
      });
      return;
    }

    if (this.form.valid) {
      this.save();
    }
  }

  private save(): void {
    this.log('SAve if valid!!');

    try {
      this.rispoService.saveCodebookEntry(this.codebookEntry).subscribe(response => {
          if (this.codebookEntry.id) {
            this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_SUCCESS.toString());

          } else {
            this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_SUCCESS.toString());

          }

          // this.rispoService.refreshCodebookData.next();
          this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_CODEBOOK_DATA, true);

          this.dialogRef.close();

        },
        error => {

          // this.rispoService.refreshCodebookData.next();
          this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_CODEBOOK_DATA, true);

          if (this.codebookEntry.id) {

            this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_ERROR.toString());

          } else {

            this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_ERROR.toString());

          }

        });
    } catch (e) {

      // this.rispoService.refreshCodebookData.next();
      this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_CODEBOOK_DATA, true);

      if (this.codebookEntry.id) {

        this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_ERROR.toString());

      } else {

        this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_ERROR.toString());

      }

    }


  }

}
