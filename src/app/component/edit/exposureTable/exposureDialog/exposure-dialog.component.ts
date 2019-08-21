import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Exposure} from '../../../../model/exposure';
import {Constants} from '../../../../utilities/Constants';
import * as _ from 'lodash';
import {Collateral} from '../../../../model/collateral';
import {CodebookService} from '../../../../service/codebook.service';
import {CodebookEntry} from '../../../../model/codebook-entry';
import {RispoService} from '../../../../service/rispo.service';
import {Client} from '../../../../model/client';
import {UserService} from '../../../../service/user.service';
import {Group} from '../../../../model/group';
import {Logger, LoggerFactory} from '../../../../core-module/service/logging/LoggerFactory';
import {forkJoin, Observable, of} from 'rxjs';
import {AbstractComponent} from '../../../../shared-module/component/abstarctComponent/abstract-component';
import {MessageBusService} from '../../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../../utilities/ReceiverID';

@Component({
  selector: 'app-exposure-dialog',
  styles: [`
    button:hover {
      box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
    }

    ,
    .numberParts {
      width: 100px;
    }

  `],
  templateUrl: 'exposure-dialog.component.html'
})
export class ExposureDialogComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('ExposureDialogComponent');
  exposureForm: FormGroup;
  typeOfCredit: FormControl;
  tenor: FormControl;
  newPrevious: FormControl;
  newPreviousOldValue: number;
  newChange: FormControl;
  newProposed: FormControl;
  newProposedOldValue: number;
  newBalance: FormControl;
  newBalanceOldValue: number;
  spread: FormControl;
  intRate: FormControl;
  fees: FormControl;
  lessThanYear: FormControl;
  plasmanType: FormControl;
  plasmanTypes: Array<CodebookEntry> = new Array<CodebookEntry>();
  commited: FormControl;
  taker: FormControl;
  takers: Array<CodebookEntry> = new Array<CodebookEntry>();
  riskClass: FormControl;
  riskClasses: Array<CodebookEntry> = new Array<CodebookEntry>();

  newCollateralName: FormControl;
  newCollateralValue: FormControl;
  collateral: Collateral;

  newSecuredPrevious: FormControl;
  newSecuredPreviousBgColor: string;

  newSecuredProposed: FormControl;
  newSecuredProposedBgColor: string;

  newSecuredBalance: FormControl;
  newSecuredBalanceBgColor: string;

  exposure: Exposure;
  client: Client;
  group: Group;
  currency: string;
  exchangeRate: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<ExposureDialogComponent>,
              private fb: FormBuilder,
              private codebookService: CodebookService,
              private rispoService: RispoService,
              private userService: UserService,
              private messageBusService: MessageBusService) {
    super(messageBusService);

    this.group = data.group;
    this.client = data.client;
    if (!!!data.client) {
      this.logger.error('ExposureDialogComponent: MAT_DIALOG_DATA: data.client is required');
      throw new Error('ExposureDialogComponent: MAT_DIALOG_DATA: data.client is required');
    }
    if (!!data.exposureToEdit) {
      this.exposure = _.cloneDeep(data.exposureToEdit); // clone the object
    } else {
      this.exposure = new Exposure();
      this.exposure.isNew = true;
      this.exposure.clientId = !!this.client ? this.client.id : null;
    }
    this.messageBusService.subscribe(value => { // put this in onInit and dialog doesn't show Tenor value
      if (value.code === ReceiverID.RECEIVER_ID_CURRENCY) {
        this.currency = value.data;
        this.setEditablePlacements(this.exposure);
      }
    }, error1 => {

    });
    this.codebookService.getPlasmanType().subscribe(response => {
      const values: Array<CodebookEntry> = Array.from(response.values());
      this.plasmanTypes = values;
      // this.plasmanTypes.unshift(this.nullCodebookEntry());
    });
    this.codebookService.getTakers().subscribe(response => {
      if (this.exposure.isNew) {
        this.exposure.taker = response.get(Constants.DEFAULT_TAKER); // setting default taker to new exposure
      }
      const values: Array<CodebookEntry> = Array.from(response.values());
      this.takers = values;
      // this.takers.unshift(this.nullCodebookEntry());

    });
    this.codebookService.getRiskClasses().subscribe(response => {
      const values: Array<CodebookEntry> = Array.from(response.values());
      this.riskClasses = values;
      // this.riskClasses.unshift(this.nullCodebookEntry());
    });
    this.rispoService.getExchangeList(Constants.EXCHANGE_STOCK_RETAIL, Constants.OZNAKA_HRK, this.group.creationDate, '', '').subscribe(value => {
      if (!!value.tecajnaLista) {
        this.exchangeRate = value.tecajnaLista.sred;
      }
    });
  }

  compareToOption(aOption: CodebookEntry, aSelection: CodebookEntry): boolean {
    if (!!!aSelection) { // selected value can be null
      if (!!!aOption.id) { // using dummy option returned by nullCodebookEntry() to represent null value
        return true;
      } else {
        return false;
      }
    } else {
      return !!aOption && !!aSelection && aOption.id === aSelection.id;
    }
  }

  /**
   * original select has an option with null value
   */
  nullCodebookEntry(): CodebookEntry {
    const empty = new CodebookEntry();
    empty.name = '-';
    empty.id = null;
    return empty;
  }

  plasmanTypeShouldBeNull(): boolean {
    return !!this.exposure.plasmanType && this.exposure.plasmanType.name === '-';
  }

  getTenorValidatorPattern(exp: Exposure): string {
    let result = '';

    if (!!!this.exposure) {
      return result;
    }
    if (!!this.exposure.tenor && this.exposure.tenor.length > 10) {
      result = Constants.TENOR_VALIDATION_DATE_AND_STRING;
    } else {
      result = Constants.TENOR_VALIDATION_DATE;
    }
    return result;
  }

  /**
   * init fields with prefix new
   */
  setEditablePlacements(e: Exposure): void {
    if (this.currency === 'HRK') {
      e.setNewPlacementsInHrk();
    } else {
      e.setNewPlacementsInEur();
    }
  }

  /**
   * dinamically creates controls to edit exposure collaterals
   */
  createCollateralControls(list: Collateral[]): FormArray {
    const result = this.fb.array(new Array());
    if (!!!list) {
      return result;
    }
    list.forEach(c => {
      result.push(new FormGroup({
        collateralName: new FormControl(),
        collateralValueHrk: new FormControl(),
        collateralValueEur: new FormControl()
      }));
    });
    return result;
  }

  ngOnInit(): void {
    this.collateral = new Collateral();

    this.newPreviousOldValue = this.exposure.newPrevious; // storing old value because ngmodel fires change event without user input and would paint the field in yellow too soon
    this.newProposedOldValue = this.exposure.newProposed;
    this.newBalanceOldValue = this.exposure.newBalance;

    this.exposureForm = new FormGroup({
      typeOfCredit: new FormControl('', [Validators.required]),
      tenor: new FormControl('', [Validators.required, Validators.pattern(this.getTenorValidatorPattern(this.exposure))]),
      newPrevious: new FormControl('', [Validators.required]),
      newChange: new FormControl(),
      newProposed: new FormControl(),
      newBalance: new FormControl(),
      spread: new FormControl(),
      intRate: new FormControl(),
      fees: new FormControl(),
      collaterals: this.createCollateralControls(this.exposure.collaterals),
      newCollateralName: new FormControl(),
      newCollateralValue: new FormControl(),
      newSecuredProposed: new FormControl(),
      newSecuredBalance: new FormControl(),
      newSecuredPrevious: new FormControl(),
      lessThanYear: new FormControl(),
      plasmanType: new FormControl('', [Validators.required]),
      commited: new FormControl(),
      taker: new FormControl('', [Validators.required]),
      riskClass: new FormControl('', [Validators.required])
    });
    this.exposureForm.get('newPrevious').valueChanges.subscribe((newValue) => {
      if (this.newPreviousOldValue !== newValue) {
        this.newSecuredPreviousBgColor = 'yellow';
        this.newPreviousOldValue = newValue;
      }
    });
    this.exposureForm.get('newProposed').valueChanges.subscribe((newValue) => {
      if (this.newProposedOldValue !== newValue) {
        this.newSecuredProposedBgColor = 'yellow';
        this.newProposedOldValue = newValue;
      }
    });
    this.exposureForm.get('newBalance').valueChanges.subscribe((newValue) => {
      if (this.newBalanceOldValue !== newValue) {
        this.newSecuredBalanceBgColor = 'yellow';
        this.newBalanceOldValue = newValue;
      }
    });

  }

  getControls(): AbstractControl[]{
    return (this.exposureForm.controls['collaterals'] as FormArray).controls;
  }
  removeCollateral(ind: number): void {
    const part1 = this.exposure.collaterals.slice(0, ind);
    const part2 = this.exposure.collaterals.slice(ind + 1);
    this.exposure.collaterals = part1.concat(part2);
    this.exposureForm.controls['collaterals'] = this.createCollateralControls(this.exposure.collaterals); // this will trigger repaint
  }

  addCollateral(silent: boolean): void {
    if (!!!this.collateral.name) {
      if (!!!silent) {
        this.showMessage('Novi kolateral', 'Unesite naziv');
      }
      return;
    }
    this.exposure.collaterals.push(this.collateral);
    this.collateral = new Collateral();
    this.exposureForm.controls['collaterals'] = this.createCollateralControls(this.exposure.collaterals); // this will trigger repaint
  }

  deleteCollaterals(lstCollateral: Array<Collateral>): Observable<Collateral[]> {
    const promiseList: Array<Promise<Collateral>> = new Array<Promise<Collateral>>();
    if (!!lstCollateral) {
      lstCollateral.forEach(value => {
        promiseList.push(this.rispoService.collateralDelete(value).toPromise());
      });
    }
    return promiseList.length > 0 ? forkJoin(promiseList) : of(Array<Collateral>()); // of() will do next on observable
  }

  /**
   *
   * @param insertNew - when true collateral's id is set to null to suggest to back to add new collateral
   */
  saveCollaterals(exposureId: number, lstCollateral: Array<Collateral>, insertNew: boolean): Observable<Collateral[]> {
    const promiseList: Array<Promise<Collateral>> = new Array<Promise<Collateral>>();
    if (!!lstCollateral) {
      lstCollateral.forEach(collateral => {
        collateral.exposureId = exposureId;
        if (insertNew) {
          collateral.id = null;
        }
        promiseList.push(this.rispoService.collateralSave(collateral).toPromise());
      });
    }
    return promiseList.length > 0 ? forkJoin(promiseList) : of(Array<Collateral>()); // of() will do next on observable
  }

  setTenorValidationToDate(): void {
    this.exposureForm.get('tenor').setValidators([Validators.required, Validators.pattern(Constants.TENOR_VALIDATION_DATE)]);
  }

  save(e: Exposure): void {
    if (!this.exposureForm.valid) {
      Object.keys(this.exposureForm.controls).forEach(field => { // {1}
        const control = this.exposureForm.get(field);            // {2}
        control.markAsTouched();       // {3}
        control.updateValueAndValidity(); // ommit this and select input validation message will not show
      });
      return;
    }

    // this.nullCodebookEntryToNull(e);
    if (e.isAnyPlacementChanged(this.currency)) {
      e.updateAllPlacement(this.exchangeRate, this.currency);
    }
    this.addCollateral(true);
    if (!!!this.exposure.id) {
      this.rispoService.exposureSave(this.exposure).subscribe(newExposure => {
        this.exposure.id = newExposure.id;
        this.saveCollaterals(newExposure.id, this.exposure.collaterals, true).subscribe(value1 => {
          this.dialogRef.close(true);
          this.showMessage(Constants.RISPO_EXPOSURE_ADD, Constants.RISPO_EXPOSURE_ADD_SUCCESS[0] + this.client.borrower + Constants.RISPO_EXPOSURE_ADD_SUCCESS[1]);
        }, error1 => {
          this.showMessage(Constants.RISPO_EXPOSURE_ADD, error1);
          this.logger.error(error1);
        });
      }, error1 => {
        this.showMessage(Constants.RISPO_EXPOSURE_ADD, error1);
        this.logger.error(error1);
      });
    } else {
      this.rispoService.exposureSave(this.exposure).subscribe(newExposure => {
        this.exposure.isNew = false;
        this.rispoService.findCollateralByOwnerId(this.exposure.id).subscribe(findCollaterals => { // to get original/unchanged collaterals
          const oldColls: Collateral[] = Array.from(findCollaterals.values());
          this.deleteCollaterals(oldColls).subscribe(value => {
            this.saveCollaterals(this.exposure.id, this.exposure.collaterals, true).subscribe(value1 => {
              this.exposure.collaterals = value1;
              this.dialogRef.close(true);
              this.showMessage(Constants.RISPO_EXPOSURE_UPDATE, Constants.RISPO_EXPOSURE_UPDATE_SUCCESS);
            }, error1 => {
              this.showMessage(Constants.RISPO_EXPOSURE_UPDATE, error1);
              this.logger.error(error1);
            });
          });
        }, error1 => {
          this.showMessage(Constants.RISPO_EXPOSURE_UPDATE, error1);
          this.logger.error(error1);
        });
      }, error1 => {
        this.showMessage(Constants.RISPO_EXPOSURE_ADD, error1);
        this.logger.error(error1);
      });
    }
    this.userService.changeOwnerIfDifferent(this.group);
    this.setTenorValidationToDate();
    this.client.updateExposure(this.exposure, false); // to repaint
  }
}
