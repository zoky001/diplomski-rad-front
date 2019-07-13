import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import {PageMetaData} from './page-meta-data';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

export class TableDataSource<T> extends DataSource<any> {

  private pageMetadata: PageMetaData;
  private paginator: MatPaginator;
  private tableResponse$: BehaviorSubject<Array<T>> = new BehaviorSubject<Array<T>>(new Array<T>());
  public tableData: BehaviorSubject<Array<T>> = new BehaviorSubject<Array<T>>(new Array<T>());
  private paginatorSub: Subscription;


  constructor(data: Array<T> = new Array<T>()) {
    super();
    this.pageMetadata = new PageMetaData();
    this.pageMetadata.offset = 0;
    this.pageMetadata.limit = 10;
    this.setTableData(data);
  }


  connect(): Observable<any> {
    return this.getTableData();
  }

  disconnect(): void {
    if (this.paginatorSub) {
      this.paginatorSub.unsubscribe();
    }
  }

  setPaginator(paginator: MatPaginator): void {
    if (paginator) {
      if (this.paginatorSub) {
        this.paginatorSub.unsubscribe();
      }
      this.paginator = paginator;
      this.paginator._intl.itemsPerPageLabel = 'Redaka po stranici: ';
      this.paginator._intl.nextPageLabel = 'Sljedeća stranica';
      this.paginator._intl.previousPageLabel = 'Prethodna stranica';
      this.paginatorSub = this.paginator.page.asObservable().subscribe(value => {
        this.onPageChange(value);
      });
    }

  }

  /**
   * On every page change we set new PageMetaData object to
   * newPaginationData stream and fetch new client list data for current page.
   */
  private onPageChange($event: any): void {

    this.pageMetadata = new PageMetaData();

    this.pageMetadata.offset = $event.pageIndex;

    this.pageMetadata.limit = $event.pageSize;

    this.setNewPaginationOnTable(this.pageMetadata);
  }

  getTableData(): Observable<Array<T>> {
    return this.tableResponse$;
  }

  getAllTableData(): BehaviorSubject<Array<T>> {
    return this.tableData;
  }

  /**
   *
   *
   *
   */
  setTableData(data: Array<T>): void {
    this.pageMetadata.offset = 0;
    this.resetClientComponent();
    this.tableData.next(data);
    this.setNewPaginationOnTable(this.pageMetadata);
  }

  /**
   *
   *
   *
   *
   */
  private setNewPaginationOnTable(pageMetaData: PageMetaData): void {
    // let clientData = this.clientListData.getValue();
    const start = pageMetaData.offset * pageMetaData.limit;
    const end = start + pageMetaData.limit;
    const data = this.tableData.getValue().slice(start, end);
    this.tableResponse$.next(data);
  }

  /**
   * Reset search values to blank strings and reload all table data
   */
  private resetClientComponent(): void {

    if (this.paginator) {

      this.paginator.pageIndex = 0;

    }

  }

}
