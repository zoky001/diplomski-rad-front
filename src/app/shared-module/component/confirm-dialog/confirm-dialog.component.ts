import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';

@Component({
  selector: 'app-confirm-dialog',
  styles: [`
    button:hover {
    box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
    }
  `],
  templateUrl: 'confirm-dialog.component.html'
})
export class ConfirmDialogComponent {

  logger: Logger = LoggerFactory.getLogger('SpinnerComponent-Universal');


  title = '';
  question = '';
  yesButtonText = 'Da';
  noButtonText = 'Ne';


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmDialogComponent>) {

    if (data.title !== undefined && data.title !== null) {
      this.title = data.title;
    }

    if (data.question !== undefined && data.question !== null) {
      this.question = data.question;
    }

    if (data.yesButtonText !== undefined && data.yesButtonText !== null) {
      this.yesButtonText = data.yesButtonText;
    }

    if (data.noButtonText !== undefined && data.noButtonText !== null) {
      this.noButtonText = data.noButtonText;
    }

  }


  addMessage(text: String): void {
    this.logger.info('RISPO MESSAGE: ' + text);
  }

  log(text: string): void {
    this.logger.info('SpinnerComponent-Universal: ' + text);
  }
}
