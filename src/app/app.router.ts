import {ModuleWithProviders} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CreateComponent} from './component/create/create.component';
import {EditComponent} from './component/edit/edit.component';
import {HomeComponent} from './component/home/home.component';
import {PlasmanTypeComponent} from './component/codebooks/plasmanType/plasman-type.component';
import {InterestRateComponent} from './component/codebooks/interestRate/interest-rate.component';
import {MultilanguageEntriesComponent} from './component/codebooks/multilanguageEntries/multilanguage-entries.component';
import {TypeOfCreditComponent} from './component/codebooks/typeOfCredit/type-of-credit.component';
import {SearchComponent} from './component/search/search.component';
import {EditDeniedComponent} from './component/editDenied/edit-denied.component';
import {GenericErrorComponent} from './component/genericErrorPage/generic-error.component';
import {PageNotFoundComponent} from './component/pageNotFound/page-not-found.component';


export const routing: ModuleWithProviders = RouterModule.forRoot([
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'create', component: CreateComponent},
  {path: 'home', component: HomeComponent},
  {path: 'edit/:id', component: EditComponent},
  {path: 'search', component: SearchComponent},
  {path: 'codebooks/plasmanType', component: PlasmanTypeComponent},
  {path: 'codebooks/interestRate', component: InterestRateComponent},
  {path: 'codebooks/multilanguageEntries', component: MultilanguageEntriesComponent},
  {path: 'codebooks/typeOfCredit', component: TypeOfCreditComponent},
  {path: 'editDenied', component: EditDeniedComponent},
  {path: 'genericError', component: GenericErrorComponent},
  {path: '404', component: PageNotFoundComponent},
  {path: '**', redirectTo: '404'}
]);


