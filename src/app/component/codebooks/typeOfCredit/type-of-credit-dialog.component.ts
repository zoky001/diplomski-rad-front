import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {Constants} from '../../../model/Constants';
import {TypeOfCreditEntry} from '../../../model/type-of-credit-entry';
import {OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Validators} from '@angular/forms';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';


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
  templateUrl: 'type-of-credit-dialog.component.html'
})
export class TypeOfCreditDialogComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('TypeOfCreditDialogComponent');


  private typeOfCreditEntry: TypeOfCreditEntry;


  form: FormGroup;

  aplikacijaControl: FormControl;
  aplikacijaValue: String;

  vopControl: FormControl;
  vopValue: String;

  kategorijaControl: FormControl;
  kategorijaValue: String;

  sifraNamjeneControl: FormControl;
  sifraNamjeneValue: String;

  nacinKoristenjaControl: FormControl;
  nacinKoristenjaValue: String;

  oznakaVrstePlasmanaControl: FormControl;
  oznakaVrstePlasmanaValue: String;

  poredakControl: FormControl;
  poredakValue: String;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rispoService: RispoService,
    public dialogRef: MatDialogRef<TypeOfCreditDialogComponent>) {
    super();
    this.typeOfCreditEntry = new TypeOfCreditEntry();

    if (data.typeOfCreditEntry !== undefined) {
      this.typeOfCreditEntry = Object.assign({}, data.typeOfCreditEntry);
    }


  }

  ngOnInit(): void {


    if (!this.form) {
      this.form = new FormGroup({
        aplikacijaControl: new FormControl(this.typeOfCreditEntry.aplikacija, [Validators.required]),
        vopControl: new FormControl(this.typeOfCreditEntry.vrstaOznakaPosla, [Validators.maxLength(3)]),
        kategorijaControl: new FormControl(this.typeOfCreditEntry.kategorija, [Validators.maxLength(2)]),
        sifraNamjeneControl: new FormControl(this.typeOfCreditEntry.sifraNamjene, [Validators.maxLength(5)]),
        nacinKoristenjaControl: new FormControl(this.typeOfCreditEntry.nacinKoristenja, [Validators.maxLength(100)]),
        oznakaVrstePlasmanaControl:
          new FormControl(this.typeOfCreditEntry.oznakaVrstePlasmana, [Validators.required, Validators.maxLength(70)]),
        poredakControl: new FormControl(this.typeOfCreditEntry.poredak, [Validators.required])
      });
    }


    // value changes listeners
    const sub = this.form.get('aplikacijaControl').valueChanges.subscribe((value) => {
      this.aplikacijaValue = value;
      this.typeOfCreditEntry.aplikacija = value;
    });
    this.subscriptions.push(sub);


    const sub1 = this.form.get('vopControl').valueChanges.subscribe((value) => {
      this.vopValue = value;
      this.typeOfCreditEntry.vrstaOznakaPosla = value;
    });
    this.subscriptions.push(sub1);

    const sub2 = this.form.get('kategorijaControl').valueChanges.subscribe((value) => {
      this.kategorijaValue = value;
      this.typeOfCreditEntry.kategorija = value;
    });
    this.subscriptions.push(sub2);

    const sub3 = this.form.get('sifraNamjeneControl').valueChanges.subscribe((value) => {
      this.sifraNamjeneValue = value;
      this.typeOfCreditEntry.sifraNamjene = value;
    });
    this.subscriptions.push(sub3);

    const sub4 = this.form.get('nacinKoristenjaControl').valueChanges.subscribe((value) => {
      this.nacinKoristenjaValue = value;
      this.typeOfCreditEntry.nacinKoristenja = value;
    });
    this.subscriptions.push(sub4);

    const sub5 = this.form.get('oznakaVrstePlasmanaControl').valueChanges.subscribe((value) => {
      this.oznakaVrstePlasmanaValue = value;
      this.typeOfCreditEntry.oznakaVrstePlasmana = value;
    });
    this.subscriptions.push(sub5);

    const sub6 = this.form.get('poredakControl').valueChanges.subscribe((value) => {
      this.poredakValue = value;
      this.typeOfCreditEntry.poredak = value;
    });
    this.subscriptions.push(sub6);


  }


  /**
   * Method that is called when user presses enter on form.
   */
  submitFormIfValid(): void {
    //   validate all input fields
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach(field => { //   {1}
        const control = this.form.get(field);            //   {2}
        control.markAsTouched({onlySelf: true});       //   {3}
      });
      return;
    }

    if (this.form.valid) {
      this.log('SAve if valid!!');
      this.save();
    }
  }


  private save(): void {

    try {
      const sub = this.rispoService.saveTypeOfCreditEntry(this.typeOfCreditEntry).subscribe(response => {
          if (response) {
            if (this.typeOfCreditEntry.id) {
              this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_SUCCESS.toString());

            } else {
              this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_SUCCESS.toString());

            }
            this.rispoService.refreshTypeOfCreditData.next();

          } else {
            this.rispoService.refreshTypeOfCreditData.next();

            if (this.typeOfCreditEntry.id) {
              this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_ERROR.toString());

            } else {
              this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_ERROR.toString());

            }
          }

          this.dialogRef.close();

        },
        error => {
          this.rispoService.refreshTypeOfCreditData.next();

          if (this.typeOfCreditEntry.id) {
            this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_ERROR.toString());

          } else {
            this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_ERROR.toString());

          }

        });

      this.subscriptions.push(sub);
    } catch (e) {
      this.rispoService.refreshTypeOfCreditData.next();

      if (this.typeOfCreditEntry.id) {
        this.addMessage(Constants.CODEBOOK_UPDATE.toString(), Constants.CODEBOOK_UPDATE_ERROR.toString());

      } else {
        this.addMessage(Constants.CODEBOOK_ADD.toString(), Constants.CODEBOOK_ADD_ERROR.toString());

      }
    }


  }


}
