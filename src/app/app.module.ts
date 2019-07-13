import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {routing} from './app.router';
import {SharedModule} from './shared/shared.module';
import {CommonModule, DatePipe} from '@angular/common';
import {CdkTableModule} from '@angular/cdk/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CreateComponent} from './component/create/create.component';
import {ClientSearchFormComponent} from './component/create/clientSearchForm/client-search-form.component';
import {ClientSearchTableComponent} from './component/create/clientSearchTable/client-search-table.component';
import {EditComponent} from './component/edit/edit.component';
import {HomeComponent} from './component/home/home.component';
import {WorkingReportSearchFormComponent} from './component/home/workingReportSearchForm/working-report-search-form.component';
import {ReportsInCreationTableComponent} from './component/home/reportsInCreationTable/reports-in-creation-table.component';
import {ReportsInProgressTableComponent} from './component/home/reportsInProgressTable/reports-in-progress-table.component';
import {LogsDialogComponent} from './component/report/logsDialog/logs-dialog.component';
import {PlasmanTypeComponent} from './component/codebooks/plasmanType/plasman-type.component';
import {MultilanguageEntriesComponent} from './component/codebooks/multilanguageEntries/multilanguage-entries.component';
import {InterestRateComponent} from './component/codebooks/interestRate/interest-rate.component';
import {TypeOfCreditComponent} from './component/codebooks/typeOfCredit/type-of-credit.component';
import {TypeOfCreditDialogComponent} from './component/codebooks/typeOfCredit/type-of-credit-dialog.component';
import {PlasmanTypeDialogComponent} from './component/codebooks/plasmanType/plasman-type-dialog.component';
import {MultilanguageEntriesDialogComponent} from './component/codebooks/multilanguageEntries/multilanguage-entries-dialog.component';
import {ReportSearchFormComponent} from './component/search/reportSearchForm/report-search-form.component';
import {ReportTableComponent} from './component/search/reportTable/report-table.component';
import {SearchComponent} from './component/search/search.component';
import {AvailableDatesComponent} from './component/availableDates/available-dates.component';
import {EditDeniedComponent} from './component/editDenied/edit-denied.component';
import {GenericErrorComponent} from './component/genericErrorPage/generic-error.component';
import {PageNotFoundComponent} from './component/pageNotFound/page-not-found.component';
import {RispoService} from './service/rispo.service';
import {UserService} from './service/user.service';
import {ClientGroupingService} from './service/client-grouping.service';
import {CodebookService} from './service/codebook.service';
import {GeneralService} from './service/general-service';
import {SecurityService} from './service/security.service';
import {ExposureGroupingService} from './service/exposure-grouping.service';
import {HttpService} from './service/http.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DemoMaterialModule} from './material-module/material-module.module';
import {MatNativeDateModule} from '@angular/material';
import {SpinnerHttpInterceptor} from './service/http-interceptor';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    routing,
    SharedModule,
    CommonModule,
    CdkTableModule,
    FormsModule,
    ReactiveFormsModule,
    DemoMaterialModule,
    MatNativeDateModule
  ],
  declarations: [
    AppComponent,
    CreateComponent,
    ClientSearchFormComponent,
    ClientSearchTableComponent,
    EditComponent,
    HomeComponent,
    WorkingReportSearchFormComponent,
    ReportsInCreationTableComponent,
    ReportsInProgressTableComponent,
    LogsDialogComponent,
    PlasmanTypeComponent,
    MultilanguageEntriesComponent,
    InterestRateComponent,
    TypeOfCreditComponent,
    TypeOfCreditDialogComponent,
    PlasmanTypeDialogComponent,
    MultilanguageEntriesDialogComponent,
    ReportSearchFormComponent,
    ReportTableComponent,
    SearchComponent,
    AvailableDatesComponent,
    EditDeniedComponent,
    GenericErrorComponent,
    PageNotFoundComponent
  ],
  providers: [
    RispoService,
    UserService,
    ClientGroupingService,
    CodebookService,
    GeneralService,
    SecurityService,
    DatePipe,
    ExposureGroupingService,
    HttpService,
    {provide: HTTP_INTERCEPTORS, useClass: SpinnerHttpInterceptor, multi: true},

  ],
  entryComponents: [
    LogsDialogComponent,
    TypeOfCreditDialogComponent,
    PlasmanTypeDialogComponent,
    MultilanguageEntriesDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
