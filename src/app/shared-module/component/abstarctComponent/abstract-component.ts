import {OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {Message} from '../../../core-module/service/messaging/model/Message';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';


export abstract class AbstractComponent implements OnDestroy {

  logger: Logger = LoggerFactory.getLogger('RispoAbstractComponentLogger');


  protected subscriptions: Subscription[] = new Array<Subscription>();


  constructor(private messageBus: MessageBusService) {


  }


  protected addMessage(title: string, body: string): void {

    this.showMessage(title, body);

  }

  protected showMessage(title: string, message: string): void {

    this.sendMessage(ReceiverID.RECEIVER_ID_SHOW_MESSAGE, {'title': title, 'message': message});

  }

  protected sendMessage(code: string, data: any) {
    const message: Message = new Message(code, data);
    this.messageBus.publish(message);
  }

  getMessage<T>(code: string): Observable<T> {
    return new Observable(observer => {
      const sub = this.messageBus.subscribe(value => {
        if (value.code === code) {
          observer.next(value.data);
        }
      }, error1 => {
        observer.error(error1);

      }, () => {
        observer.complete();

      });

      this.subscriptions.push(sub);


    });


  }

  protected log(text: any): void {

    this.logger.info('RISPO-LOGGER: ' + text);

  }

  ngOnDestroy(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


}
