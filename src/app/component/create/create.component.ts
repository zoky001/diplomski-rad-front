import { Component, OnDestroy, OnInit } from '@angular/core';
import { RispoService } from '../../service/rispo.service';
import { AbstractComponent } from '../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../shared/logging/LoggerFactory';


@Component({
  selector: 'app-create',
  templateUrl: 'create.component.html',
  styleUrls: ['create.component.scss']
})
export class CreateComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('CreateComponent');


  constructor(public rispoService: RispoService) {
    super();
  }


  ngOnInit(): void {

    this.rispoService.setTitle('kreiranje izvještaja');
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.rispoService.setDafaultTitle();
  }

}
