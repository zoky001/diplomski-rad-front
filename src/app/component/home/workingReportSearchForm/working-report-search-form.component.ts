import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchType} from '../../../model/SearchType';
import {Constants} from '../../../utilities/Constants';
import {RispoService} from '../../../service/rispo.service';
import {ReportStatus} from '../../../model/report-status';
import {Group} from '../../../model/group';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';


@Component({
  selector: 'app-working-report-search-form',
  templateUrl: 'working-report-search-form.component.html',
  styleUrls: ['working-report-search-form.component.scss']
})
export class WorkingReportSearchFormComponent extends AbstractComponent implements OnDestroy, OnInit {


  constructor(private rispoService: RispoService,
              private messageBusService: MessageBusService) {
    super(messageBusService);

  }


  public static searchActive = false;

  logger: Logger = LoggerFactory.getLogger('WorkingReportSearchFormComponent');
  showClearSearchBtn = false;
  searchForm: FormGroup;


  data: FormControl;
  dataMaxLength = 30;
  exposureDate: FormControl;
  searchType: FormControl;
  currency: FormControl;
  exposureViewOptions: FormControl;

  selectedType: SearchType;
  searchTypes: SearchType[];

  searchData: String;
  currencies: String[];
  selectedCurrency: String;


  exposureViewOptionsValues: String[];
  selectedExposureViewOption: String;


  selectedExposureDate: Date;
  minDate: Date;
  maxDate: Date;

  fetchByExistingGroupMembers: boolean;
  checkBoxEnabled: boolean;

  ngOnInit(): void {


    this.initSearchForm();


    const sub = this.messageBusService.subscribe(value => {
        if (value.code === ReceiverID.RECEIVER_ID_REFRESH_HOME_COMPONENT) {
          this.clearSearchedReports();

        }
      }
    );

    this.subscriptions.push(sub);

  }


  private initSearchForm(): void {

    this.searchTypes = Constants.ARCHIVE_SEARCH_TYPES;
    this.selectedType = Constants.ARCHIVE_SEARCH_TYPE_KPO;
    this.dataMaxLength = this.selectedType.maxLength;


    this.searchForm = new FormGroup({
      searchType: new FormControl(this.selectedType),
      data: new FormControl(this.searchData, [Validators.required, Validators.pattern(this.selectedType.regex)])
    });


    // value changes listeners
    this.searchForm.get('searchType').valueChanges.subscribe((searchType) => {
      this.selectedType = searchType;
      this.dataMaxLength = this.selectedType.maxLength;
      this.clearSearchData();
    });

    this.searchForm.get('data').valueChanges.subscribe((data) => {
      this.searchData = data;
    });
  }

  private clearSearchData(): void {
    this.searchData = '';
    this.searchForm.controls['data'].setValue(this.searchData);
    this.searchForm.controls['data'].setValidators([Validators.required, Validators.pattern(this.selectedType.regex)]);
  }


  /**
   * Method that is called when user presses enter on form.
   */
  submitFormIfValid(): void {
    // validate all input fields
    if (!this.searchForm.valid) {
      Object.keys(this.searchForm.controls).forEach(field => {
        const control = this.searchForm.get(field);
        control.markAsTouched({onlySelf: true});
      });
      return;
    }

    if (this.searchForm.valid) {
      this.search();
    }
  }


  private formatSearchData(): void {
    if (this.selectedType === Constants.ARCHIVE_SEARCH_TYPE_KPO && !this.searchData.endsWith(Constants.ARCHIVE_SEARCH_TYPE_KPO.type)) {
      this.searchData = this.searchData + Constants.ARCHIVE_SEARCH_TYPE_KPO.type;
    }
  }

  /**
   * Method that is called when search button was clicked.
   */
  private search(): void {


    this.log('submit if valid!!');
    WorkingReportSearchFormComponent.searchActive = true;
    this.formatSearchData();


    this.rispoService.findGroup(this.selectedType.typeNumber, this.searchData, ReportStatus.IN_PROGRESS.valueOf()).subscribe(response => {


      this.showClearSearchBtn = true;
      // this.log('Primljeni podatci: ' + JSON.stringify(response));
      // this.rispoService.setReportsInProgressTableData(response);

      this.sendMessage(ReceiverID.RECEIVER_ID_REPORT_IN_PROGRESS_DATA, response);


      }, err => {

      this.log('Greska kod dohvata klijenata:  + err');
      this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_FETCH_ERROR.toString());

      // this.rispoService.setReportsInProgressTableData(new Array<Group>());
      this.sendMessage(ReceiverID.RECEIVER_ID_REPORT_IN_PROGRESS_DATA, new Array<Group>());

    });

  }


  /**
   * Reset search values to blank strings and reload all table data
   */
  clearSearchedReports(): void {

    try {

      WorkingReportSearchFormComponent.searchActive = false;
      // this.rispoService.fetchReportsInProcess.next();
      this.sendMessage(ReceiverID.RECEIVER_ID_FETCH_REPORT_IN_PROCESS, true);
      this.showClearSearchBtn = false;
      this.clearSearchData();
      this.initSearchForm();


    } catch (e) {
      this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_FETCH_ERROR.toString());
    }


  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    WorkingReportSearchFormComponent.searchActive = false;

  }

}
