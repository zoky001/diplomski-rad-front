import {Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {Constants} from '../../../model/Constants';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Validators} from '@angular/forms';
import {PlasmanTypeEntry} from '../../../model/plasman-type-entry';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';
import {SpinnerComponent} from '../../../shared/component/spinner-component/spinner.component';


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
  templateUrl: 'plasman-type-dialog.component.html'
})
export class PlasmanTypeDialogComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('PlasmanTypeDialogComponent');


  private plasmanTypeEntry: PlasmanTypeEntry;


  private isEditMode = false;

  form: FormGroup;

  aplikacijaControl: FormControl;
  aplikacijaValue: String;

  oznLimitaControl: FormControl;
  oznLimitaValue: String;


  sifraNamjeneControl: FormControl;
  sifraNamjeneValue: String;

  tipControl: FormControl;
  tipValue: String;

  @ViewChild('spinner') spinner: SpinnerComponent;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private rispoService: RispoService,
              public dialogRef: MatDialogRef<PlasmanTypeDialogComponent>) {
    super();
    this.plasmanTypeEntry = new PlasmanTypeEntry();

    if (data.plasmanTypeEntry !== undefined) {
      this.plasmanTypeEntry = Object.assign({}, data.plasmanTypeEntry);

    }

    if (data.isEditMode !== undefined) {
      this.isEditMode = data.isEditMode;
    }

  }

  ngOnInit(): void {


    if (!this.form) {
      this.form = new FormGroup({
        aplikacijaControl: new FormControl(this.plasmanTypeEntry.aplikacija, [Validators.required, Validators.maxLength(30)]),
        oznLimitaControl: new FormControl(this.plasmanTypeEntry.oznakaLimita, [Validators.maxLength(1)]),
        sifraNamjeneControl: new FormControl(this.plasmanTypeEntry.sifraNamjene, [Validators.maxLength(5)]),
        tipControl: new FormControl(this.plasmanTypeEntry.tip, [Validators.maxLength(70), Validators.required])
      });

    }


    // value changes listeners
    const sub = this.form.get('aplikacijaControl').valueChanges.subscribe((value) => {
      this.aplikacijaValue = value;
      this.plasmanTypeEntry.aplikacija = value;
    });
    this.subscriptions.push(sub);


    const sub1 = this.form.get('oznLimitaControl').valueChanges.subscribe((value) => {
      this.oznLimitaValue = value;
      this.plasmanTypeEntry.oznakaLimita = value;
    });
    this.subscriptions.push(sub1);


    const sub3 = this.form.get('sifraNamjeneControl').valueChanges.subscribe((value) => {
      this.sifraNamjeneValue = value;
      this.plasmanTypeEntry.sifraNamjene = value;
    });
    this.subscriptions.push(sub3);

    const sub4 = this.form.get('tipControl').valueChanges.subscribe((value) => {
      this.tipValue = value;
      this.plasmanTypeEntry.tip = value;
    });
    this.subscriptions.push(sub4);


  }


  /**
   * Method that is called when user presses enter on form.
   */
  submitFormIfValid(): void {
    // validate all input fields
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach(field => { // {1}
        const control = this.form.get(field);            // {2}
        control.markAsTouched({onlySelf: true});       // {3}
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
      this.rispoService.savePlacementTypeEntry(this.plasmanTypeEntry).subscribe(response => {

          if (this.plasmanTypeEntry.id) {
            this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_SUCCESS.toString());

          } else {
            this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_SUCCESS.toString());
          }


          this.rispoService.refreshPlacementTypeData.next();

          this.dialogRef.close();

        },
        error => {
          this.rispoService.refreshPlacementTypeData.next();

          this.log('PLASAMAN TYPE ERROR ' + JSON.stringify(error));

          if (this.plasmanTypeEntry.id) {
            this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_ERROR.toString());
          } else {
            this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_ERROR.toString());
          }
        });

    } catch (e) {

      this.rispoService.refreshPlacementTypeData.next();

      this.log('PLASAMAN TYPE ERROR ' + JSON.stringify(e));
      if (this.plasmanTypeEntry.id) {

        this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_ERROR.toString());

      } else {

        this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_ERROR.toString());

      }

    }

  }
}
