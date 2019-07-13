import { Component, OnDestroy, OnInit } from '@angular/core';
import { RispoService } from '../../service/rispo.service';
import { AbstractComponent } from '../../shared/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../shared/logging/LoggerFactory';


@Component({
  selector: 'app-search-component',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})
export class SearchComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('SearchComponent');


  constructor(public rispoService: RispoService) {
    super();
  }


  ngOnInit(): void {

    this.rispoService.setTitle('zaključani izvještaji');

  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.rispoService.setDafaultTitle();
  }


}
