
import {OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {AppComponent} from '../../../app.component';
import {Logger, LoggerFactory} from '../../logging/LoggerFactory';


export abstract class AbstractComponent implements OnDestroy {

  logger: Logger = LoggerFactory.getLogger('RispoAbstractComponentLogger');


  protected subscriptions: Subscription[] = new Array<Subscription>();


  constructor() {


  }


  protected addMessage(title: string, body: string): void {

    AppComponent.showMessage(title, body);

  }

  protected log(text: any): void {

    this.logger.info('RISPO-LOGGER: ' + text);

  }

  ngOnDestroy(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


}
