import {Component, OnDestroy, OnInit} from '@angular/core';
import {RispoService} from '../../service/rispo.service';
import {AbstractComponent} from '../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../core-module/service/logging/LoggerFactory';
import {MatDialog} from '@angular/material';
import {MessageBusService} from '../../core-module/service/messaging/message-bus.service';


@Component({
  selector: 'app-create',
  templateUrl: 'create.component.html',
  styleUrls: ['create.component.scss']
})
export class CreateComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('CreateComponent');


  constructor(public rispoService: RispoService,
              private messageBusService: MessageBusService) {
    super(messageBusService);
  }


  ngOnInit(): void {

    // this.rispoService.setTitle('kreiranje izvještaja');
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.rispoService.setDafaultTitle();
  }

}
