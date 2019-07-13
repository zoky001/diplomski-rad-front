import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatTableDataSource} from '@angular/material';
import {RispoService} from '../../../service/rispo.service';
import {AbstractComponent} from '../../../shared/component/abstarctComponent/abstract-component';
import {InterestRateReference} from '../../../model/interest-rate-reference';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';
import {SpinnerComponent} from '../../../shared/component/spinner-component/spinner.component';

@Component({
  selector: 'app-interest-rate',
  templateUrl: 'interest-rate.component.html',
  styleUrls: ['interest-rate.component.scss']
})
export class InterestRateComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('InterestRateComponent');

  numberOfEntries: number;

  dataSource = new MatTableDataSource<InterestRateReference>();

  displayedColumns: any = [
    'name',
    'description'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild('spinner') spinner: SpinnerComponent;


  constructor(private rispoService: RispoService,
              public dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;

    this.spinner.track([RispoService.CALL_TRACKING_TOKEN_INTEREST_RATE]);

    this.loadEntries();

  }


  refresh(): void {

    this.loadEntries();

  }

  private loadEntries(): void {

    const sub = this.rispoService.getInterestRateEntries().subscribe(responseData => {

      this.dataSource.data = responseData;

      this.numberOfEntries = responseData.length;

    }, error1 => {
      this.log('getInterestRateEntries() ERROR: ' + error1);
    });

    this.subscriptions.push(sub);

  }


}
