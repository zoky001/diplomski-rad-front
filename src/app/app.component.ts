import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from './shared/component/abstarctComponent/abstract-component';
import {GeneralService} from './service/general-service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {SimpleInfoDialogComponent} from './shared/component/simple-info-dialog/simple-info-dialog.component';
import {UserService} from './service/user.service';
import {RispoService} from './service/rispo.service';
import {NavigationStart, Router} from '@angular/router';
import {Constants} from './model/Constants';
import {Logger, LoggerFactory} from './shared/logging/LoggerFactory';
import {SpinnerComponent} from './shared/component/spinner-component/spinner.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends AbstractComponent implements OnDestroy, OnInit {


  constructor(public userService: UserService,
              public rispoService: RispoService,
              public dialog: MatDialog,
              private router: Router) {
    super();

    AppComponent.generalService.getMessage().subscribe(value => {
      if (value.receiverId && value.receiverId === Constants.RECEIVER_ID_SHOW_MESSAGE) {

        if (!!!AppComponent.isMessageDialogOpen) {
          AppComponent.isMessageDialogOpen = true;
          this.dialogRef = this.dialog.open(SimpleInfoDialogComponent, {
            data: {
              title: value.data.title,
              content: value.data.message
            },
            width: '25%'
          });
        }
        this.dialogRef.afterClosed().subscribe(value1 => {
          AppComponent.isMessageDialogOpen = false;
        });
      }
    });
  }


  @ViewChild('spinner') spinner: SpinnerComponent;

  static generalService: GeneralService = new GeneralService();
  static isMessageDialogOpen: boolean;
  title = 'diplomski-rad-rispo ';
  logger: Logger = LoggerFactory.getLogger('ClientSearchFormComponent');
  selected: any;
  reportMenu: any = [
    {'key': 1, 'label': 'KREIRAJ NOVI', 'route': 'create'},
    {'key': 2, 'label': 'IZVJEŠTAJI U RADU', 'route': 'home'},
    {'key': 3, 'label': 'ZAKLJUČANI IZVJEŠTAJI', 'route': 'search'}
  ];

  adminMenu: any = [
    {'label': 'TYPE OF CREDIT', 'route': 'codebooks/typeOfCredit'},
    {'label': 'VIŠEJEZIČNI ŠIFRARNICI', 'route': 'codebooks/multilanguageEntries'},
    {'label': 'KAMATNA STOPA', 'route': 'codebooks/interestRate'},
    {'label': 'PLASMAN TYPE', 'route': 'codebooks/plasmanType'}
  ];
  private dialogRef: MatDialogRef<SimpleInfoDialogComponent>;
  public haveAnyFunction = false;

  static showMessage(title: string, message: string): void {
    AppComponent.generalService.sendMessage(Constants.RECEIVER_ID_SHOW_MESSAGE, {'title': title, 'message': message});
  }

  ngOnInit(): void {

    this.selectActivatedPageInDropdown();

    this.userService.loggedUser.subscribe(value => {

        if (this.userService.getLoggedUserUser().username !== '' &&
          (this.userService.getLoggedUserUser().canEditCodebooks || this.userService.getLoggedUserUser().canSearch || this.userService.getLoggedUserUser().canEditData)) {
          this.setRights(true);
        } else if (this.userService.getLoggedUserUser().username !== '' &&
          !this.userService.getLoggedUserUser().canEditCodebooks && !this.userService.getLoggedUserUser().canSearch && !this.userService.getLoggedUserUser().canEditData) {
          this.setRights(false);
        } else {
          this.setRights(true);
        }

      }
    );

    this.spinner.track([RispoService.CALL_TRACKING_TOKEN]);

    this.userService.checkLoggedUserData();

  }

  private selectActivatedPageInDropdown(): void {

    try {
      this.log('Activated ROUTER:' + this.router.url);

      this.reportMenu.forEach(value => {
        if (this.router.url.toString().indexOf(value.route) > 0) {
          this.selected = value.key;
        }
      });


      const sub = this.router.events.subscribe(value => {
        if (value instanceof NavigationStart) {

          this.log('ROUTER:' + value.url);

          this.reportMenu.forEach(url => {
            if (this.router.url.toString().indexOf(url.route) > 0) {
              this.selected = url.key;
            }
          });

        }
      });
      this.subscriptions.push(sub);
    } catch (e) {

    }

  }

  private setRights(have: boolean): void {

    this.haveAnyFunction = have;

  }


  redirectToRCCPage(): void {
    window.open('https://intranet.zaba.zbo/RCC/RC/login.do', '_blank');
  }

  openManual(): void {
    window.open('assets/documents/Uputa.pdf', '_blank');
  }


  navigateTo(text: any): void {

    if (this.router.url.toString().indexOf('home') > 0 && text === 'home') {

      AppComponent.generalService.sendMessage(Constants.RECEIVER_ID_REFRESH_HOME_COMPONENT, '');

    }

  }


  ngOnDestroy(): void {

    super.ngOnDestroy();
    this.userService.deleteLoggedUserData();
    AppComponent.generalService = new GeneralService();

  }


}

