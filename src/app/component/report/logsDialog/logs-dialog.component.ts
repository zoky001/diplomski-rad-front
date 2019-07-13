import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {SpinnerComponent} from '../../../shared/component/spinner-component/spinner.component';

@Component({
  selector: 'app-logs.dialog',
  styleUrls: ['logs-dialog.component.scss'],
  templateUrl: 'logs-dialog.component.html'
})
export class LogsDialogComponent extends AbstractComponent implements OnInit {

  logs: Array<string> = new Array<string>();

  private groupId = 0;

  @ViewChild('spinner') spinner: SpinnerComponent;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private rispoService: RispoService) {
    super();

    if (data.groupId !== undefined) {
      this.groupId = data.groupId;
    }

  }

  ngOnInit(): void {

    this.spinner.track([RispoService.CALL_TRACKING_TOKEN_LOGS_MODAL]);

    this.rispoService.findLogsByGroup(this.groupId, true).subscribe(response => {

      this.logs = response;

    });

  }

}


