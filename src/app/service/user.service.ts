import {Injectable} from '@angular/core';
import {User} from '../model/user';
import {BehaviorSubject, Observable} from 'rxjs';
import {RispoService} from './rispo.service';
import {WsKorisnikPOSifraData} from '../model/ws-korisnik-PO-sifra-data.';
import {Group} from '../model/group';
import {Logger, LoggerFactory} from '../core-module/service/logging/LoggerFactory';
import {MessageBusService} from '../core-module/service/messaging/message-bus.service';
import {Message} from '../core-module/service/messaging/model/Message';
import {ReceiverID} from '../utilities/ReceiverID';


@Injectable()
export class UserService {

  private logger: Logger = LoggerFactory.getLogger('UserService');

  public loggedUser: BehaviorSubject<User> = new BehaviorSubject<User>(new User('', [], []));


  constructor(/*private userDataService: UserDataService,*/
              private rispoService: RispoService,
              private messageBusService: MessageBusService) {

    this.laodLoggedUserData();

  }

  changeOwnerIfDifferent(g: Group): void {
    if (this.getLoggedUserUser().username !== g.owner) {
      this.rispoService.updateGroupOwner(g.id, this.getLoggedUserUser().username).subscribe(value => {
      });
    }
  }

  checkLoggedUserData(): void {

    const username = 'Z003275'; // todo  this.userDataService.getUserData().principal.username;

    if (this.getLoggedUserUser().username === null || this.getLoggedUserUser().username === '') {
      this.laodLoggedUserData();
    } else if (this.getLoggedUserUser().username !== username) {
      this.laodLoggedUserData();
    }

  }


  private laodLoggedUserData(): void {

    try {
      this.obtainUser().then(value => {
        const user: User = value;


        // this.log(JSON.stringify(user));

        if (user.functions.length === 0) {
          //  ((HttpServletResponse) response).sendRedirect("Error403.xhtml");
          this.log('Korisnik' + user.username + 'nema RISPO funkcija');
          this.addMessage('Autorizacija', 'Korisnik ' + user.username + ' nema RISPO funkcija');
          this.setLoggedUserUser(user);

        } else {
          this.setLoggedUserUser(user);
        }

      });
    } catch (e) {
      this.log('Greška prilikom autorizacije korisnika: ' + JSON.stringify(e));
      this.addMessage('Autorizacija', 'Došlo je do pogreške prilikom autorizacije korisnika.');

    }


  }

  private obtainUser(): Promise<User> {

    const username = ''; // todo  this.userDataService.getUserData().principal.username;

    let promise: Promise<User>;
    if (username === null || username === '') {
      promise = this.createHardCodedUser();
    } else {
      promise = this.getUserDataFromSova(username);
    }
    //   promise = this.createHardCodedUser();
    return promise;
  }

  private createHardCodedUser(): Promise<User> {

    return new Promise<User>((resolve) => {
      try {
        let user: User;
        const username = 'tris001';

        let funkcije: string[] = [];
        funkcije.push('RISPO01');
        funkcije.push('RISPO02');
        funkcije.push('RISPO03');

        let orgJedinice: string[] = [];
        orgJedinice.push('RISPO02');
        orgJedinice.push('RISPO03');

        user = new User(username, funkcije, orgJedinice);
        user.checkSecurity = false;

        resolve(user);


        /* todo  this.getFunkcije(username).then(funkcije => {

            funkcije.push('RISPO02');
            funkcije.push('RISPO03');

            this.getOrgJedinice(username, funkcije).then(value => {

              const orgJedinice: Array<string> = value;
              user = new User(username, funkcije, orgJedinice);
              user.checkSecurity = false;

              resolve(user);

            });

          }, reason => {


          });*/

      } catch (e) {
        this.logger.info('Error createHardCodedUser: ERROR: ' + e);
        throw new Error('Error createHardCodedUser: ERROR: ' + e);
      }
    });
  }

  private getFunkcije(username: String): Promise<Array<string>> {
    const funkcije: Array<string> = new Array<string>();

    // return funkcije;

    return new Promise<Array<string>>((resolve) => {
      try {

        this.rispoService.wSKorisnikAutorizacija('RISPO', username.toString()).subscribe(fetchedData => {
          fetchedData.forEach(data => {
            funkcije.push(data.funkcija);
          });
          resolve(funkcije);
        }, err => {
          this.log('Greska kod dohvata getFunkcije (' + username + ',' + funkcije + ')' + err);
          throw new Error('Error getFunkcije: ERROR IN subscription: ');
        });


      } catch (e) {
        this.logger.info('Error getFunkcije: ERROR: ' + e);
        throw new Error('Error getFunkcije: ERROR: ' + e);
      }
    });
  }

  private getOrgJedinice(username: string, funkcije: Array<String>): Promise<Array<string>> {
    return new Promise<Array<string>>((resolve) => {
      try {

        const orgJedinice: Array<string> = new Array<string>();

        let subscription: Observable<Array<WsKorisnikPOSifraData>>;

        if (funkcije.some(x => x === 'RISPO01')) {
          subscription = this.rispoService.wSKorisnikPOSifra(username, 'RISPO01', '1');
        } else if (funkcije.some(x => x === 'RISPO02')) {
          subscription = this.rispoService.wSKorisnikPOSifra(username, 'RISPO02', '1');
        } else {
          resolve(orgJedinice);
        }
        // todo


        if (subscription !== undefined && subscription !== null) {
          subscription.subscribe(fetchedData => {
            fetchedData.forEach(data => {
              orgJedinice.push(data.sifraPO);
            });

            resolve(orgJedinice);
          }, err => {

            this.log('Greska kod dohvata getOrgJedinice (' + username + ',' + funkcije + ')' + err);
            throw new Error('Error getOrgJedinice: ERROR IN subscription: ');
          });


        } else {
          throw new Error('Error getOrgJedinice: ERROR IN subscription: ');
        }


        //  throw new Error('Greska kod spremanja nekih plasmana');

      } catch (e) {
        this.logger.info('Error getOrgJedinice: ERROR: ' + e);
        throw new Error('Error getOrgJedinice: ERROR: ' + e);
      }
    });

  }

  private getUserDataFromSova(username: string): Promise<User> {
    this.log('USERNAME FROM CERT:: ' + username);

    return new Promise<User>((resolve) => {
      try {

        this.getFunkcije(username).then(funkcije => {

          this.getOrgJedinice(username, funkcije).then(value => {

            const orgJedinice: Array<string> = value;
            const user: User = new User(username, funkcije, orgJedinice);
            resolve(user);

          });

        }, reason => {


        });


      } catch (e) {
        this.logger.info('Error getUserDataFromSova: ERROR: ' + e);
        throw new Error('Error getUserDataFromSova: ERROR: ' + e);
      }
    });
  }


  getLoggedUserUser(): User {
    return this.loggedUser.getValue();
  }


  deleteLoggedUserData(): void {
    this.setLoggedUserUser(new User('', [], []));
  }

  private setLoggedUserUser(user: User): void {
    this.loggedUser.next(user);
  }

  public canEditData(): boolean {

    return this.loggedUser.getValue().canEditData;

  }


  log(text: any): void {
    this.logger.info('CREATE RISPO LOGGER: ' + text);
  }

  /*  addMessage(text: String, showDialog: boolean = true): void {

      if (showDialog) {

        this.dialog.open(MessageComponent, {data: text});

      }

      this.logger.info('RISPO MESSAGE: ' + text);

    }*/

  addMessage(title: string, body: string): void {


    const message: Message = new Message(ReceiverID.RECEIVER_ID_SHOW_MESSAGE, {'title': title, 'message': body});
    this.messageBusService.publish(message);

  }


  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ERROR handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  errorHandler(error: any): void {
    this.logger.info('ERROR: rispo.service => ' + error);
  }


}
