import {Injectable} from '@angular/core';
import {Message} from './model/Message';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';

@Injectable()
export class MessageBusService {

  private bus: Subject<Message>;

  constructor() {
    this.bus = new Subject<Message>();
  }

  publish(message: Message): void {
    this.bus.next(message);
  }

  subscribe(next?: (value: Message) => void, error?: (error: any) => void, complete?: () => void): Subscription {
    return this.bus.subscribe(value => next(value), error1 => error(error1), () => complete());
  }
}
