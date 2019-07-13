import { DataSource } from '@angular/cdk/collections';
import { RispoService } from '../../service/rispo.service';
import {Observable} from 'rxjs';

export class ReportsInProgressTableDataSource extends DataSource<any> {

  constructor(private rispoService: RispoService) {
    super ();
  }

  connect(): Observable<any> {
    return this.rispoService.getReportsInProgressTableData();
  }

  disconnect(): void {
  }
}
