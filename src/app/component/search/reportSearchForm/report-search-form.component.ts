import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchType } from '../../../model/SearchType';
import { Constants } from '../../../model/Constants';
import { RispoService } from '../../../service/rispo.service';
import { ReportStatus } from '../../../model/report-status';
import { Group } from '../../../model/group';
import { UserService } from '../../../service/user.service';
import { MatDialog } from '@angular/material';
import { SecurityService } from '../../../service/security.service';
import { ClientSearchResponse } from '../../../model/client-search-response';
import { AbstractComponent } from '../../../shared/component/abstarctComponent/abstract-component';
import { GeneralService } from '../../../service/general-service';
import {Logger, LoggerFactory} from '../../../shared/logging/LoggerFactory';


@Component({
  selector: 'app-report-search-form',
  templateUrl: 'report-search-form.component.html',
  styleUrls: ['report-search-form.component.scss']
})
export class ReportSearchFormComponent extends AbstractComponent implements OnDestroy, OnInit {

  logger: Logger = LoggerFactory.getLogger('ReportSearchFormComponent');

  form: FormGroup;


  dataMaxLength = 30;
  data: FormControl;
  searchType: FormControl;


  selectedType: SearchType;
  searchTypes: SearchType[];

  searchData: string;


  constructor(private rispoService: RispoService,
              public userService: UserService,
              private securityService: SecurityService,
              public dialog: MatDialog,
              public generalService: GeneralService) {
    super();

  }

  ngOnInit(): void {


    this.searchTypes = Constants.ARCHIVE_SEARCH_TYPES;

    this.selectedType = Constants.ARCHIVE_SEARCH_TYPE_KPO;

    this.dataMaxLength = this.selectedType.maxLength;


    if (!this.form) {

      this.form = new FormGroup({

        searchType: new FormControl(this.selectedType),

        data: new FormControl(this.searchData, [Validators.required, Validators.pattern(this.selectedType.regex)])

      });

    }


    // value changes listeners
    this.form.get('searchType').valueChanges.subscribe((searchType) => {
      this.selectedType = searchType;

      this.dataMaxLength = this.selectedType.maxLength;

      this.clearSearchData();
    });

    this.form.get('data').valueChanges.subscribe((data) => {
      this.searchData = data;
    });


  }


  clearSearchData(): void {
    this.searchData = '';
    this.form.controls['data'].setValue(this.searchData);
    this.form.controls['data'].setValidators([Validators.required, Validators.pattern(this.selectedType.regex)]);
  }


  /**
   * get date on the last day of the month
   */
  dateOnEOM(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }


  /**
   * Checks if form is valid before searching data.
   */
  get formValid(): boolean {
    return this.form.valid;
  }


  /**
   * Method that is called when user presses enter on form.
   */
  submitFormIfValid(): void {


    // validate all input fields
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach(field => { // {1}
        const control = this.form.get(field);            // {2}
        control.markAsTouched({onlySelf: true});       // {3}
      });
      return;
    }

    if (this.formValid) {
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
    this.formatSearchData();

    try {
      this.dohvatiGrupeSaClanovimaZaKojeImaPrava();
    } catch (e) {

      this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_FETCH_ERROR.toString());

    }


  }

  private dohvatiGrupeSaClanovimaZaKojeImaPrava(): void {

    if (this.userService.getLoggedUserUser().checkSecurity) {

      if (this.selectedType === Constants.ARCHIVE_SEARCH_TYPE_KPO) {

        this.dohvatiGrupePoKpoZaKojeImaPrava();


      } else {

        this.dohvatiClanoveBezGrupeZaKojeImaPrava();

      }
    } else {

      this.dohvatiGrupeZaKojeNemaPrava();

    }

  }


  private dohvatiGrupePoKpoZaKojeImaPrava(): void {

    let orgJed: string = null;

    this.securityService.dohvatiOrgJedGrupe(this.searchData).then(res => {

      this.log(res);

      orgJed = res;

      if (orgJed == null) {
        // this.rispoService.setReportsTableData(new Array<Group>());
        this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, new Array<Group>());
        return;
      } else {


        if (this.userService.getLoggedUserUser().orgJeds.some(x => x === orgJed)) {// ima prava na KPO, dohvati sve

          this.rispoService.findGroup(this.selectedType.typeNumber, this.searchData, ReportStatus.LOCKED).subscribe(response => {

            this.log(response);

            // this.rispoService.setReportsTableData(response);
            this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, response);


          }); // END rispoService.findGroup

        } else {
          // 	List<String> regNumbers = getRispoServiceManager().getGroupRepository().getDistinctMembersForGroup(data); // dohvati
          // 			this.printJSON(regNumbers);


          // dohvati sve članove za taj KPO iz baze
          this.rispoService.getDistinctMembersForGroup(this.searchData).subscribe(response => {

            this.log(response);

            const regNumber = response;

            if (regNumber.length === 0) {

              // this.rispoService.setReportsTableData(new Array<Group>());
              this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, new Array<Group>());
              return;

            } else {

              // dohvati one članove za koje nema prava  sve
              this.securityService.dohvatiClanoveZaKojeNemaPrava(regNumber, this.userService.getLoggedUserUser()).then(responsedohvatiClanoveZaKojeNemaPrava => {

                const clanovi: Array<string> = responsedohvatiClanoveZaKojeNemaPrava;

                this.log(responsedohvatiClanoveZaKojeNemaPrava);

                if (clanovi.length === regNumber.length) { // nema prava na niti jednog - baci grešku
                  this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_DENIED.toString());
                } else if (clanovi.length === 0) { // ima prava na sve - dohvati sve
                  this.rispoService.findGroup(this.selectedType.typeNumber, this.searchData, ReportStatus.LOCKED).subscribe(responsefindGroup => {

                    // this.log(response);

                    // this.rispoService.setReportsTableData(responsefindGroup);
                    this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, responsefindGroup);


                  }); // END rispoService.findGroup


                } else { // dohvati one grupe koje sadrže članove na koja ima prava
                  this.rispoService.findByKpoWithoutClients(this.searchData, clanovi).subscribe(responsefindByKpoWithoutClients => {

                    // this.log(response);

                    // this.rispoService.setReportsTableData(responsefindByKpoWithoutClients);
                    this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, responsefindByKpoWithoutClients);

                  }); // END rispoService.findGroup

                }

              });

            }


            // this.rispoService.setReportsTableData(response);

          }); // END rispoService.getDistinctMembersForGroup

        }


      }


    }); // END  this.rispoService.dohvatiOrgJedGrupe


  }

  private dohvatiClanoveBezGrupeZaKojeImaPrava(): void {

    this.rispoService.getClientData(this.selectedType, this.searchData).subscribe(clientSearchResponse => {


      this.log(clientSearchResponse);

      const clientData: ClientSearchResponse = clientSearchResponse;

      if (clientData.status === 0 && (clientData.data !== undefined && clientData.data !== null) && clientData.data.length === 1) {

        const regNumber: string = clientData.data[0].registerNumber;

        this.securityService.dohvatiOrgJedKlijenta(regNumber).then(response => {

          const orgKlijenta: string = response.oj;

          // this.functions.some(x => x === 'RISPO01');
          if (this.userService.getLoggedUserUser().orgJeds.some(x => x === orgKlijenta)) {// ima prava, dohvati sve

            this.rispoService.findGroup(this.selectedType.typeNumber, this.searchData, ReportStatus.LOCKED).subscribe(responseFindGroup => {

              // this.log(response);

              // this.rispoService.setReportsTableData(responseFindGroup);
              this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, responseFindGroup);


            }); // END rispoService.findGroup


          } else { // nema prava - baci grešku

            this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_DENIED.toString());

          }


        });


      } else {

        this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_DENIED.toString());

      }


    }, err => {

      this.log('Greska kod dohvata klijenata:  + err');
      this.addMessage(Constants.CLIENT_FETCH.toString(), Constants.CLIENT_FETCH_ERROR.toString());

      return;  // finish method ??

    });


  }

  private dohvatiGrupeZaKojeNemaPrava(): void {

    /*   groups = getRispoServiceManager().getGroupRepository().find(type.getType(), data,
         ReportStatus.LOCKED.getValue());
       this.printJSON(groups);*/

    this.rispoService.findGroup(this.selectedType.typeNumber, this.searchData, ReportStatus.LOCKED).subscribe(response => {

      // this.log(response);

      // this.rispoService.setReportsTableData(response);
      this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, response);


    }); // END rispoService.findGroup

  }


  /**
   * Reset search values to blank strings and reload all table data
   */
  clearSearchedReports(): void {

    try {

      this.rispoService.fetchReportsInProcess.next();

      this.clearSearchData();


    } catch (e) {
      this.addMessage(Constants.REPORTS_FETCH.toString(), Constants.REPORTS_FETCH_ERROR.toString());
    }
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    // this.rispoService.setReportsTableData(new Array<Group>());
    this.generalService.sendMessage(Constants.RECEIVER_ID_REPORT_TABLE, new Array<Group>());


  }


}
