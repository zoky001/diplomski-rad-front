import {Component, OnDestroy, OnInit} from '@angular/core';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {AbstractComponent} from '../abstarctComponent/abstract-component';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';
import {Subscription} from 'rxjs';

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
export class SpinnerComponent extends AbstractComponent implements OnInit, OnDestroy {

  get numberOfActiveSpinner() {
    return SpinnerComponent.numberOfActiveSpinner;
  }


  constructor(
    private messageBusService: MessageBusService) {
    super(messageBusService);
  }

  private static numberOfActiveSpinner = 0;

  /*  class="example-margin"
      [color]="color"
      [mode]="mode"
      [value]="value">*/
  logger: Logger = LoggerFactory.getLogger('SpinnerComponent');

  show = false;
  trackingTokens: string[];


  sub: Subscription;


  track(trackingTokens: string[]): void {
    this.trackingTokens = trackingTokens;
  }

  ngOnInit(): void {
    SpinnerComponent.numberOfActiveSpinner++;

    // this.httpInterceptor.intercept()
    this.sub = this.messageBusService.subscribe(value => {
      if (value.code && value.code === ReceiverID.RECEIVER_ID_SPINNER) {

        const result: { show: boolean, trackingToken: string } = value.data;
        this.logger.info('Spinner component' + JSON.stringify(result));
        if (result.show && this.ifExistTrackingToken(result.trackingToken) && SpinnerComponent.numberOfActiveSpinner > 0) {
          this.show = result.show;
        } else if (!result.show) {
          if (this.show && SpinnerComponent.numberOfActiveSpinner > 0 && this.ifExistTrackingToken(result.trackingToken)) {
            this.show = result.show;
          }
        }
      }
    });

    this.subscriptions.push(this.sub);
  }

  ifExistTrackingToken(token: string): boolean {

    let exist = false;

    if (!!!token) {
      return false;
    }
    try {
      let selectedToken = '';
      for (let i = 0; this.trackingTokens && i < this.trackingTokens.length; i++) {
        selectedToken = this.trackingTokens[i];
        if (selectedToken && token && (selectedToken.trim() === token.trim())) {
          exist = true;
        }

      }
    } catch (e) {

    }

    return exist;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    SpinnerComponent.numberOfActiveSpinner--;

  }


}
