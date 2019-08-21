import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RispoService} from '../../../service/rispo.service';
import {Group, LoadGroupDataStatus} from '../../../model/group';
import {Constants} from '../../../utilities/Constants';
import {Exposure} from '../../../model/exposure';
import {UserService} from '../../../service/user.service';
import {MAT_DIALOG_DATA, MatDialog, MatSelectChange} from '@angular/material';
import {ExposureDialogComponent} from './exposureDialog/exposure-dialog.component';
import {Client} from '../../../model/client';
import {ConfirmDialogComponent} from '../../../shared-module/component/confirm-dialog/confirm-dialog.component';
import {GroupingCriteria} from '../../../model/grouping-criteria';
import {GroupExposureDialogComponent} from './groupExposureDialog/group-exposure-dialog.component';
import {ExposureGroupingService} from '../../../service/exposure-grouping.service';
import {SpinnerComponent} from '../../../shared-module/component/spinner-component/spinner.component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {forkJoin} from 'rxjs';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';
import {Utility} from '../../../utilities/Utility';

@Component({
  selector: 'app-exposure-table',
  templateUrl: 'exposure-table.component.html',
  styleUrls: ['exposure-table.component.scss']
})
export class ExposureTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public rispoService: RispoService,
              public userService: UserService,
              public dialog: MatDialog,
              private exposureGroupingService: ExposureGroupingService,
              private messageBusService: MessageBusService) {
    super(messageBusService);
    this.currency = data.currency;
  }

  logger: Logger = LoggerFactory.getLogger('ExposureTableComponent');
  group: Group = new Group();
  showAllClients: boolean;
  amountFormatTypes: any = [
    {'label': 'U tisućama', 'value': true},
    {'label': 'Apsolutni iznos', 'value': false}
  ];
  showNakKam = false;
  btnKamNakText: string;
  currency: string;
  amountFormatThousand = false;

  exposureRowMenu: any;
  groupExposuresRowMenu: any;

  selecedColumns: string[];
  showBrojLimitaCol: boolean;
  showBrojOkviraCol: boolean;
  showBrojUgovoraCol: boolean;
  showBrojPartijeCol: boolean;
  colIdBrLimita = 'brLimita';
  colIdBrOkvira = 'brOkvira';
  colIdBrUgovora = 'brUgovora';
  colIdBrPartije = 'brPartije';

  selectColumnsNames: any = [{'label': 'Broj limita', 'value': this.colIdBrLimita},
    {'label': 'Broj okvira', 'value': this.colIdBrOkvira},
    {'label': 'Broj ugovora', 'value': this.colIdBrUgovora},
    {'label': 'Broj partije', 'value': this.colIdBrPartije}];

  GroupingCriteria: any = GroupingCriteria;

  // ExposureTableComponent: any = ExposureTableComponent; // a hack to access static members from template

  get ExposureTableComponent(): Utility {
    return Utility.getInstance();
  }


  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.rispoService.getReportsDetailsGroupBS().subscribe(group => {
      this.group = group;
    }, error1 => {

    });
    this.messageBusService.subscribe(value => {
      if (value.code === ReceiverID.RECEIVER_ID_SHOW_MEMBERS) {
        this.showAllClients = value.data;
      } else if (value.code === ReceiverID.RECEIVER_ID_CURRENCY) {
        this.currency = value.data;
        // todo valutu moram nekak drugač prosljediti !!! this.currency = value.data;
      }
    }, error1 => {

    });
    this.prikaziKamiNkOnClick();
  }

  prikaziKamiNkOnClick(): void {
    this.showNakKam = !this.showNakKam;
    if (this.showNakKam) {
      this.btnKamNakText = 'SAKRIJ KAMATE I NAPLATE';
    } else {
      this.btnKamNakText = 'PRIKAŽI KAMATE I NAPLATE';

    }
  }

  isCutWarning(exp: Exposure): boolean {
    if (!!exp.source && !!exp.typeOfCredit) {
      return !!exp.source && !!exp.typeOfCredit && exp.source.indexOf(Constants.APL_CUT) !== -1 && exp.typeOfCredit.indexOf(Constants.OZNAKA_HRK) === -1;
    } else {
      return false;
    }
  }

  showEditDialog(c: Client, e: Exposure): void {
    this.dialog.open(ExposureDialogComponent,
      {
        data: {
          client: c,
          exposureToEdit: e,
          group: this.group
        },
        width: 'auto'
      });
  }

  showDeleteDialog(c: Client, e: Exposure): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: Constants.RISPO_EXPOSURE_REMOVE,
          question: Constants.RISPO_EXPOSURE_REMOVE_QUESTION
        },
        width: '25%'
      });

    dialogRef.afterClosed().subscribe(value => {

      const result: boolean = value;
      if (result) {
        this.removeExposure(c, e);
      }
    }, error1 => {
      this.logger.error('Greska kod brisanja izloženosti' + JSON.stringify(error1));
      this.showMessage(Constants.RISPO_EXPOSURE_REMOVE, Constants.RISPO_EXPOSURE_REMOVE_ERROR);
    }, () => {
    });

  }

  removeExposure(c: Client, e: Exposure): void {
    this.rispoService.exposureDelete(e).subscribe(deletedExposure => {
      c.updateExposure(deletedExposure, true);
      this.userService.changeOwnerIfDifferent(this.group);
      this.group.refreshIndexes();
      this.showMessage(Constants.RISPO_EXPOSURE_REMOVE, Constants.RISPO_EXPOSURE_REMOVE_SUCCESS);
    });
  }

  /**
   * show exposure and grouping rows as unit thus simulating subtable and it's footer
   */
  showExposuresSubTable(member: Client): boolean {
    return !!member && !!member.exposures && member.exposures.length > 0 || (this.showAllClients && ((member.feesHRK > 0 || member.intRateHRK > 0) && this.showNakKam));
  }

  showColumns(): void {
    this.showBrojLimitaCol = this.selecedColumns.indexOf(this.colIdBrLimita) !== -1;
    this.showBrojOkviraCol = this.selecedColumns.indexOf(this.colIdBrOkvira) !== -1;
    this.showBrojUgovoraCol = this.selecedColumns.indexOf(this.colIdBrUgovora) !== -1;
    this.showBrojPartijeCol = this.selecedColumns.indexOf(this.colIdBrPartije) !== -1;
  }

  /**
   * colspan number needs to be adjusted when it stretches across columns that change visibility otherwise there is misalignment with neighbouring rows
   * @param start - inital number of columns in colspan
   */
  adjustColspan(start: number): number {
    return start - ((!!!this.showBrojLimitaCol ? 1 : 0) + (!!!this.showBrojOkviraCol ? 1 : 0) + (!!!this.showBrojUgovoraCol ? 1 : 0) + (!!!this.showBrojPartijeCol ? 1 : 0));
  }

  showGroupingButton(): boolean {
    return this.userService.canEditData() && !this.group.isLocked;
  }

  showUngroupButton(exposure: Exposure): boolean {
    return this.userService.canEditData() && exposure.grouped;
  }

  groupSelectedExposures(): void {
    let parentClient: Client = null;
    const exposures: Exposure[] = new Array<Exposure>();
    if (!!!this.group.members) {
      return;
    }
    try {
      for (const c of this.group.members) {
        for (const e of c.exposures) {
          if (e.selected && (!!!e.changeHrk || !!!e.changeEur)) {
            exposures.push(e);
          }
        }
        if (exposures.length > 0) {
          parentClient = c; // selected exposures could belong to different clients but first client is chosen as parent of grouped exsposure
          break;
        }
      }
      if (exposures.length === 0) {
        this.showMessage(Constants.RISPO_EXPOSURE_GROUP, 'Nema odabranih plasmana za grupiranje');
        return;
      }
      const groupedExposure = this.exposureGroupingService.group(exposures, parentClient.id);
      const promiseList: Array<Promise<Exposure>> = new Array<Promise<Exposure>>();
      this.rispoService.exposureSave(groupedExposure).subscribe(newExposure => {
        groupedExposure.id = newExposure.id;
        for (const e of exposures) {
          e.groupedExposureId = groupedExposure.id; // grouping candidates become children of new group
          promiseList.push(this.rispoService.exposureSave(e).toPromise());
        }
        this.userService.changeOwnerIfDifferent(this.group);
        forkJoin(promiseList).subscribe(value => {


          const ref = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
            if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
              this.showMessage(Constants.RISPO_EXPOSURE_GROUP, Constants.RISPO_EXPOSURE_GROUP_SUCCESS);
              ref.unsubscribe();
            }
          }, error1 => {
            ref.unsubscribe();
          });

          // this.rispoService.loadGroupData.next();

          this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
            {'id': this.group.id + '', 'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA}
          );


        });
      });

    } catch (e) {
      this.showMessage(Constants.RISPO_EXPOSURE_GROUP, e.message);
    }
  }

  /**
   * returns value for given criteria
   */
  groupingCriteriaValue(groupCriteria: GroupingCriteria, e: Exposure): string {
    let result = '';
    if (groupCriteria === GroupingCriteria.LIMIT) {
      result = e.brojLimita;
    } else if (groupCriteria === GroupingCriteria.OKVIR) {
      result = e.brojOkvira;
    } else if (groupCriteria === GroupingCriteria.UGOVOR) {
      result = e.brojUgovora;
    }
    return result;
  }

  /**
   * replaces groupByLimit, groupByOkvir,...
   */
  groupByCriteria(groupCriteria: GroupingCriteria): void {
    let parentClient: Client = null;
    const exposures: Exposure[] = new Array<Exposure>();
    let groupingSeed: string;
    if (!!!this.group.members) {
      return;
    }
    try {
      for (const c of this.group.members) {
        for (const e of c.exposures) {
          if (e.selected) {
            groupingSeed = this.groupingCriteriaValue(groupCriteria, e);
            break;
          }
        }
        if (!!groupingSeed) {
          for (const e of c.exposures) {
            if (groupingSeed === this.groupingCriteriaValue(groupCriteria, e) && (e.changeHrk == null || e.changeHrk === 0 || e.changeEur === null || e.changeEur === 0)) {
              exposures.push(e); // same client as of groupingSeed above
            }
          }
          if (exposures.length > 0) {
            parentClient = c;
          }
          break;
        } else {
          this.showMessage(Constants.RISPO_EXPOSURE_GROUP, 'Nema odabranih plasmana za grupiranje');
          return;
        }
      }
      const groupedExposure = this.exposureGroupingService.group(exposures, parentClient.id);
      const promiseList: Array<Promise<Exposure>> = new Array<Promise<Exposure>>();
      this.rispoService.exposureSave(groupedExposure).subscribe(newExposure => {
        groupedExposure.id = newExposure.id;
        for (const e of exposures) {
          e.groupedExposureId = groupedExposure.id; // grouping candidates become children of new group
          promiseList.push(this.rispoService.exposureSave(e).toPromise());
        }
        forkJoin(promiseList).subscribe(value => {
          const ref = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
            if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
              this.showMessage(Constants.RISPO_EXPOSURE_GROUP, Constants.RISPO_EXPOSURE_GROUP_SUCCESS);
              ref.unsubscribe();
            }
          });

          // this.rispoService.loadGroupData.next();

          this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
            {'id': this.group.id + '', 'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA}
          );


        });
      });

    } catch (e) {
      this.showMessage(Constants.RISPO_EXPOSURE_GROUP, e.message);
    }
  }

  ungroupExposure(exposure: Exposure, clientId: number): void {
    this.rispoService.ungroupExposure(exposure, clientId).subscribe(value => {
      const ref = this.getMessage<{ id: string, status: LoadGroupDataStatus }>(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA).subscribe(value1 => {
        if (value1.status === LoadGroupDataStatus.LOAD_GROUP_DATA_COMPLETED) {
          this.showMessage(Constants.RISPO_EXPOSURE_GROUP, Constants.RISPO_EXPOSURE_UNGROUP_SUCCESS);
          ref.unsubscribe();
        }
      });
      // this.rispoService.loadGroupData.next();

      this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
        {'id': this.group.id + '', 'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA}
      );


    }, error1 => {
      this.showMessage(Constants.RISPO_EXPOSURE_GROUP, Constants.RISPO_EXPOSURE_UNGROUP_ERROR);
    });
  }

  amountFormatThousandOnChange(event: MatSelectChange): void {
    this.sendMessage(ReceiverID.RECEIVER_ID_THOUSAND_FORMAT, event.value);
  }

  groupExposureDialogShow(): void {
    this.dialog.open(GroupExposureDialogComponent,
      {
        data: {
          groupId: this.group.id,
          currency: this.currency,
          amountFormatThousand: this.amountFormatThousand
        },
        width: 'auto'
      });
  }

  tableWidth(): string {
    return Math.floor(window.screen.availWidth * 0.99375) + 'px';
  }

  getBackgroundColor(client: Client): string {
    if (client.selected) {
      return 'yellow';
    } else {
      return '';
    }
  }
}
