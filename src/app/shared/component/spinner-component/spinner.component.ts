import {Component, OnInit} from '@angular/core';
import {Logger, LoggerFactory} from '../../logging/LoggerFactory';
import {AppComponent} from '../../../app.component';
import {Constants} from '../../../model/Constants';

@Component({
  selector: 'app-spinner',
  styles: [`.spinner-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 998;

  mat-spinner {
    width: 6rem;
    height: 6rem;
  }

  }`],
  template: `
    <div class="spinner-wrapper" *ngIf="show">
      <mat-spinner>
      </mat-spinner>
    </div>

  `
})
export class SpinnerComponent implements OnInit {

  /*  class="example-margin"
      [color]="color"
      [mode]="mode"
      [value]="value">*/
  logger: Logger = LoggerFactory.getLogger('SpinnerComponent');


  title = '';
  question = '';
  yesButtonText = 'Da';
  noButtonText = 'Ne';

  show = false;

  constructor() {

  }


  track(trackingTokens: string[]): void {
    // todo add logic
  }

  ngOnInit(): void {
    // this.httpInterceptor.intercept()
    AppComponent.generalService.getMessage().subscribe(value => {
      if (value.receiverId && value.receiverId === Constants.RECEIVER_ID_SPINNER) {

        const result: { show: boolean, trackingToken: string } = value.data;

        // todo treba posložiti filtere da bude spinner radio this.show = result.show;
        this.logger.info('Spinner component' + JSON.stringify(result));

      }


    });
  }


}
