import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {RispoService} from '../../../../service/rispo.service';
import {RispoIzlozenostSuma} from '../../../../model/rispo-izlozenost-suma';
import {SpinnerComponent} from '../../../../shared-module/component/spinner-component/spinner.component';
import {Logger, LoggerFactory} from '../../../../core-module/service/logging/LoggerFactory';
import {AbstractComponent} from '../../../../shared-module/component/abstarctComponent/abstract-component';
import {MessageBusService} from '../../../../core-module/service/messaging/message-bus.service';
import {Utility} from '../../../../utilities/Utility';

@Component({
  selector: 'app-group-exposure-dialog',
  styleUrls: ['group-exposure-dialog.component.scss'],
  templateUrl: 'group-exposure-dialog.component.html'
})
export class GroupExposureDialogComponent extends AbstractComponent implements OnInit {
  logger: Logger = LoggerFactory.getLogger('GroupExposureDialogComponent');
  currency: string;
  amountFormatThousand = true;

  // todo ExposureTableComponent: any = ExposureTableComponent; // a hack to access static members from template

  get ExposureTableComponent(): Utility {
    return Utility;
  }

  groupId: string;
  groupExposure: RispoIzlozenostSuma;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<GroupExposureDialogComponent>,
              private rispoService: RispoService,
              private messageBusService: MessageBusService) {
    super(messageBusService);

    this.groupId = data.groupId;
    this.currency = data.currency;
    this.amountFormatThousand = data.amountFormatThousand;
  }

  ngOnInit(): void {
    if (!!this.currency) {
      this.rispoService.totalGroupExposure(this.groupId, this.currency).subscribe(value1 => {
        this.groupExposure = value1;
      });
    } else {
      this.showMessage('Sumarna izloženost', 'currency is not set');
    }
  }
}
