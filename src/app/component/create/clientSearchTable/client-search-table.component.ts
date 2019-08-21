import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {ClientData} from '../../../model/client-data';
import {RispoService} from '../../../service/rispo.service';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';


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

  constructor(private rispoService: RispoService,
              private messageBusService: MessageBusService) {
    super(messageBusService);
  }

  ngOnInit(): void {


    this.dataSource.paginator = this.paginator;


    const sub = this.messageBusService.subscribe(value => {
      if (value.code === ReceiverID.RECEIVER_ID_CLIENT_SEARCH_TABLE) {
        this.dataSource.data = value.data;
      }
    }, error1 => {

    });

    this.subscriptions.push(sub);


  }

  fetchByClient(clientData: ClientData): void {

    // todo neka sprobavam this.rispoService.fetchByClient.next(clientData);

    this.sendMessage(ReceiverID.RECEIVER_ID_FETCH_BY_CLIENT, clientData);

  }


}
