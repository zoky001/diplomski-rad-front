import {Component, OnDestroy, OnInit} from '@angular/core';
import {RispoService} from '../../service/rispo.service';
import {AbstractComponent} from '../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../core-module/service/logging/LoggerFactory';
import {MessageBusService} from '../../core-module/service/messaging/message-bus.service';


@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('HomeComponent');


  constructor(public rispoService: RispoService,
              private messageBusService: MessageBusService) {
    super(messageBusService);
  }

  ngOnInit(): void {

    // this.rispoService.setTitle('izvještaji u radu');

  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.rispoService.setDafaultTitle();
  }
}
