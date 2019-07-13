import { Component, OnDestroy, OnInit } from '@angular/core';
import { RispoService } from '../../service/rispo.service';
import { AbstractComponent } from '../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../shared/logging/LoggerFactory';


@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('HomeComponent');


  constructor(public rispoService: RispoService) {
    super();
  }

  ngOnInit(): void {

    this.rispoService.setTitle('izvještaji u radu');

  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.rispoService.setDafaultTitle();
  }
}
