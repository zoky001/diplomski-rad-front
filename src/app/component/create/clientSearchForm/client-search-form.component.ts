import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchType} from '../../../model/SearchType';
import {Constants} from '../../../utilities/Constants';
import {Data} from '../../../model/data';
import {RispoService} from '../../../service/rispo.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ClientSearchResponse} from '../../../model/client-search-response';
import {ClientData} from '../../../model/client-data';
import {MatDialog} from '@angular/material';
import {UserService} from '../../../service/user.service';
import {AbstractComponent} from '../../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../../core-module/service/logging/LoggerFactory';
import {MessageBusService} from '../../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../../utilities/ReceiverID';


@Component({
  selector: 'app-client-search-form',
  templateUrl: 'client-search-form.component.html',
  styleUrls: ['client-search-form.component.scss']
})
export class ClientSearchFormComponent extends AbstractComponent implements OnInit, OnDestroy {

  logger: Logger = LoggerFactory.getLogger('ClientSearchFormComponent');

  private REGISTER_NUMBER_SEARCH_TYPE = 5;

  private clients: Array<ClientData>;

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


  constructor(public userService: UserService,
              private rispoService: RispoService,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              private messageBusService: MessageBusService) {
    super(messageBusService);

  }

  ngOnInit(): void {

    this.selectedExposureViewOption = Constants.EXPOSURE_VIEW_HISTORY_GROUP_MEMBERS;

    this.selectedCurrency = Constants.CURRENCY_HRK;

    this.selectedType = Constants.SEARCH_TYPE_KPO;

    this.dataMaxLength = this.selectedType.maxLength;

    this.searchTypes = Constants.SEARCH_TYPES_ALL;

    this.currencies = [Constants.CURRENCY_HRK, Constants.CURRENCY_EUR];

    this.exposureViewOptionsValues = [Constants.EXPOSURE_VIEW_HISTORY_GROUP_MEMBERS, Constants.EXPOSURE_VIEW_CURRENT_GROUP_MEMBERS];


    const currentDate: Date = new Date();
    this.selectedExposureDate = currentDate;
    this.maxDate = currentDate;
    this.minDate = this.substractMonths(currentDate, 13);

    this.fetchByExistingGroupMembers = false;
    this.checkBoxEnabled = true;


    /* todo neka sprobavam   const sub1 = this.rispoService.fetchByClient.subscribe(clientData => {

         this.fetchByClient(clientData);

       });

       this.subscriptions.push(sub1);*/


    const sub = this.getMessage<ClientData>(ReceiverID.RECEIVER_ID_FETCH_BY_CLIENT).subscribe(clientData => {
      this.fetchByClient(clientData);
    });

    this.subscriptions.push(sub);


    if (!this.searchForm) {
      this.searchForm = new FormGroup({

        searchType: new FormControl(this.selectedType),

        data: new FormControl(this.searchData, [Validators.required, Validators.pattern(this.selectedType.regex)]),

        exposureDate: new FormControl(this.selectedExposureDate),

        currency: new FormControl(this.selectedCurrency),

        exposureViewOptions: new FormControl({value: this.selectedExposureViewOption, disabled: this.checkBoxEnabled})

      })
      ;

    }

    // value changes listeners
    const sub2 = this.searchForm.get('searchType').valueChanges.subscribe((searchType) => {

      this.selectedType = searchType;
      this.dataMaxLength = this.selectedType.maxLength;

      this.clearSearchData();

    });

    this.subscriptions.push(sub2);


    const sub3 = this.searchForm.get('data').valueChanges.subscribe((data) => {

      this.searchData = data;

    });

    this.subscriptions.push(sub3);


    const sub4 = this.searchForm.get('exposureDate').valueChanges.subscribe((exposureDate) => {

      this.selectedExposureDate = exposureDate;

      this.onDateSelect(exposureDate);

    });

    this.subscriptions.push(sub4);


    const sub5 = this.searchForm.get('currency').valueChanges.subscribe((currency) => {

      this.selectedCurrency = currency;

    });

    this.subscriptions.push(sub5);


    const sub6 = this.searchForm.get('exposureViewOptions').valueChanges.subscribe((exposureViewOptions) => {

      this.selectedExposureViewOption = exposureViewOptions;

    });
    this.subscriptions.push(sub6);


  }


  private clearSearchData(): void {
    this.searchData = '';
    this.searchForm.controls['data'].setValue(this.searchData);
    this.searchForm.controls['data'].setValidators([Validators.required, Validators.pattern(this.selectedType.regex)]);
  }


  /**
   * Prevent every days, except last day in month, from being selected in datepicker.
   */
  myFilter = (d: Date): boolean => {

    // current day
    const currentDate: Date = new Date(new Date().setHours(0, 0, 0, 0));
    const date: Date = new Date(d.setHours(0, 0, 0, 0));
    if (currentDate.getTime() === date.getTime()) {
      return true;
    } else {
      // last day in every month
      const dateOnEOM: Date = this.dateOnEOM(d);
      const dayInEOM = dateOnEOM.getDate();
      const currentDayInMonth = d.getDate();

      return currentDayInMonth === dayInEOM;
    }
  }

  /**
   * get date on the last day of the month
   */
  dateOnEOM(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }


  onDateSelect(date: Date): void {

    this.log('On Date Select??');

    // current day
    const currentDate: Date = new Date(new Date().setHours(0, 0, 0, 0));
    const expDate: Date = new Date(date.setHours(0, 0, 0, 0));
    if (currentDate.getTime() === expDate.getTime()) {
      this.checkBoxEnabled = true;
      this.selectedExposureViewOption = Constants.EXPOSURE_VIEW_HISTORY_GROUP_MEMBERS;
      this.searchForm.controls['exposureViewOptions'].setValue(this.selectedExposureViewOption);
      this.searchForm.controls['exposureViewOptions'].disable();
    } else {
      this.checkBoxEnabled = false;
      this.searchForm.controls['exposureViewOptions'].enable();
    }
  }

  isCheckBoxEnabled(): boolean {
    return this.checkBoxEnabled;
  }

  /**
   * Substract months from date
   *
   * @param date - date
   * @param num - number of months
   */
  substractMonths(date: Date, num: number): Date {
    const newDate: Date = new Date(date);
    const thisMonth = newDate.getMonth();
    newDate.setMonth(thisMonth - num);
    if (newDate.getMonth() !== thisMonth - 1 && (newDate.getMonth() !== 11 || (thisMonth === 11 && newDate.getDate() === 1))) {
      newDate.setDate(0);
    }
    return newDate;
  }


  /**
   * Method that is called when user submit form.
   */
  submitFormIfValid(): void {
    if (!this.searchForm.valid) {
      Object.keys(this.searchForm.controls).forEach(field => {
        const control = this.searchForm.get(field);
        control.markAsTouched({onlySelf: true});
      });
      return;
    }

    if (this.searchForm.valid) {
      this.fetchClients();
    }

  }


  private formatSearchData(): void {
    if (this.selectedType === Constants.SEARCH_TYPE_KPO && !this.searchData.endsWith(Constants.SEARCH_TYPE_KPO.type)) {

      this.searchData = this.searchData + Constants.SEARCH_TYPE_KPO.type;

    }

  }

  /**
   * Radi pretragu po MB, OIB, KPO, Nazivu.
   * Ako je tip pretrage KPO, odmah ide u RispoWS po izloženost
   * Inače ide u clientIdentification servis po podatke o klijentima i
   * ako servis vrati jedan rezultat zove RispoWS, inače se na ekranu prikazuje popis rezultata
   */
  private fetchClients(): void {

    // this.log('submit if valid!!');


    this.formatSearchData();

    if (this.selectedType === Constants.SEARCH_TYPE_KPO) {
      this.fetchData(this.searchData, this.selectedType.typeNumber, this.selectedCurrency, this.selectedExposureDate);
    } else {

      // this.log('submit if valid!! \n else: poziv servisa (nije KPO)');

      let response: ClientSearchResponse = null;

      //

      this.rispoService.getClientData(this.selectedType, this.searchData).subscribe(clientSearchResponse => {

        response = clientSearchResponse;

        if (response === null) {
          this.addMessage(Constants.CLIENT_FETCH.toString(), Constants.CLIENT_FETCH_TIMEOUT.toString());
        } else if (response.status !== 0) {

          this.addMessage(Constants.CLIENT_FETCH.toString(), response.message);

        } else if (response.data.length === 1) {
          this.fetchByClient(response.data[0]);
        } else {
          // this.log('Primljeni podatci prije filtera: ' + JSON.stringify(response.data));

          // is client active
          this.clients = response.data.filter(data => data.clientStatus === 'Y');

          // this.log('Primljeni podatci nkaon filtera: ' + JSON.stringify(this.clients));
          // this.rispoService.setTableData(this.clients);
          this.sendMessage(ReceiverID.RECEIVER_ID_CLIENT_SEARCH_TABLE, this.clients);


        }
      }, err => {

        this.log('Greska kod dohvata klijenata:  + err');
        this.addMessage(Constants.CLIENT_FETCH.toString(), Constants.CLIENT_FETCH_ERROR.toString());

        return;  // finish method ??

      });
    }

  }


  fetchByClient(client: ClientData): void {
    this.fetchData(client.registerNumber, this.REGISTER_NUMBER_SEARCH_TYPE, this.selectedCurrency, this.selectedExposureDate);
  }

  /**
   * Dohvat izloženosti
   *
   * @param criteria kpo ili broj registra klijenta/grupe za koji se dohvaća izloženost
   * @param type oznaka tipa po kojem se dohvaća izloženost (npr. 5 - brRegistra)
   * @param date - exposure date
   */
  fetchData(criteria: String, type: number, currency: String, date: Date): void {

    let data: Data = null;

    // needs to be formatted 'yyyy-MM-dd'

    // format month in  2 digits
    let month: string;

    if (date.getMonth() + 1 < 10) {
      month = '0' + String((date.getMonth() + 1));
    } else {
      month = String((date.getMonth() + 1));
    }

    // format month in  2 digits
    let day: string;
    if (date.getDate() < 10) {
      day = '0' + String((date.getDate()));
    } else {
      day = String((date.getDate()));
    }

    const dateStr: string = date.getFullYear() + '-' + month + '-' + day + '';

    // this.log('IME:   ' + this.userDataService.getUserData().name);


    const sub = this.rispoService.getData(
      criteria, type, currency, dateStr, this.userService.getLoggedUserUser().username, this.getFetchCurrentGroupMembers())
      .subscribe(fetchedData => {

        data = fetchedData;
        // this.log('Primljeni podatci: ' + JSON.stringify(fetchedData));
        if (data == null) {
          this.addMessage(Constants.GROUP_FETCH.toString(), Constants.GROUP_FETCH_TIMEOUT.toString());
        } else if (data.error) {
          this.addMessage(Constants.GROUP_FETCH.toString(), data.errorMsg);
        } else {
          this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_FETCH_CREATING.toString());

          // Relative navigation back to Home.html
          this.router.navigate(['../home'], {relativeTo: this.route});
        }

      }, err => {

        this.log('Greska kod dohvata grupe za kriterij (' + criteria + ',' + type + ') + err');
        this.addMessage(Constants.GROUP_FETCH.toString(), Constants.GROUP_FETCH_ERROR.toString());
        return;  // finish this method ??

      });
    this.subscriptions.push(sub);


  }

  // NT helper metoda za odabir pregleda
  getFetchCurrentGroupMembers(): boolean {
    if (this.selectedExposureViewOption === Constants.EXPOSURE_VIEW_CURRENT_GROUP_MEMBERS) {
      return true;
    }
    return false;
  }


  /**
   * Reset search values to blank strings and reload all table data
   */
  resetClientComponent(): void {
    // this.data.reset();
    // this.exposureDate.reset();
    //  this.searchForm.reset();
    this.clearSearchData();
  }


  getTooltipMessage(): String {
    return 'Ova opcija je omogućena samo za povijesni datum! Ako je aktivna, ' +
      'dohvaća se povijesna izloženost za trenutne članove pojedine grupe.';
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    // this.rispoService.setClientsSearchTableData(new Array<ClientData>());
    this.sendMessage(ReceiverID.RECEIVER_ID_CLIENT_SEARCH_TABLE, new Array<ClientData>());

  }

}
