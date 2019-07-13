import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {ClientData} from '../../../model/client-data';
import {RispoService} from '../../../service/rispo.service';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {Constants} from '../../../model/Constants';
import {GeneralService} from '../../../service/general-service';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';
import {SpinnerComponent} from '../../../shared/component/spinner-component/spinner.component';


@Component({
  selector: 'app-client-search-table',
  templateUrl: 'client-search-table.component.html',
  styleUrls: ['client-search-table.component.scss']
})
export class ClientSearchTableComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('ClientSearchTableComponent');

  dataSource = new MatTableDataSource<ClientData>();

  length = 0;

  displayedColumns: any = [
    'clientName',
    'uniqueNumber',
    'uniqueId',
    'registerNumber',
    'choice'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild('spinner') spinner: SpinnerComponent;


  constructor(private rispoService: RispoService,
              public generalService: GeneralService) {
    super();

  }

  ngOnInit(): void {


    this.dataSource.paginator = this.paginator;


    const sub = this.generalService.getMessage().subscribe(value => {
      if (value.receiverId === Constants.RECEIVER_ID_CLIENT_SEARCH_TABLE) {
        this.dataSource.data = value.data;
      }
    }, error1 => {

    });

    this.subscriptions.push(sub);


  }

  fetchByClient(clientData: ClientData): void {

    this.rispoService.fetchByClient.next(clientData);

  }


}
