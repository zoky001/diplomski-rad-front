import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {SpinnerComponent} from '../../../shared-module/component/spinner-component/spinner.component';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';

@Component({
  selector: 'app-logs.dialog',
  styleUrls: ['logs-dialog.component.scss'],
  templateUrl: 'logs-dialog.component.html'
})
export class LogsDialogComponent extends AbstractComponent implements OnInit {

  logs: Array<string> = new Array<string>();

  private groupId = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private rispoService: RispoService,
              private messageBusService: MessageBusService) {
    super(messageBusService);

    if (data.groupId !== undefined) {
      this.groupId = data.groupId;
    }

  }

  ngOnInit(): void {

    this.rispoService.findLogsByGroup(this.groupId, true).subscribe(response => {

      this.logs = response;

    });

  }

}


