import {Component, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {ReceiverID} from '../../utilities/ReceiverID';
import {AbstractComponent} from '../../shared-module/component/abstarctComponent/abstract-component';
import {RispoService} from '../../service/rispo.service';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {MessageBusService} from '../../core-module/service/messaging/message-bus.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent extends AbstractComponent implements OnInit {

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

  constructor(public userService: UserService,
              public rispoService: RispoService,
              // todo  private headerService: HeaderService,
              public dialog: MatDialog,
              private router: Router,
              private messageBusService: MessageBusService) {
    super(messageBusService);

  }

  ngOnInit() {
  }


  openManual(): void {
    window.open('assets/documents/Uputa.pdf', '_blank');
  }

  navigateTo(text: any): void {

    if (this.router.url.toString().indexOf('home') > 0 && text === 'home') {

      this.sendMessage(ReceiverID.RECEIVER_ID_REFRESH_HOME_COMPONENT, '');

    }

  }

}
