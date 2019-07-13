import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {Logger, LoggerFactory} from '../shared/logging/LoggerFactory';
import {finalize} from 'rxjs/operators';
import {AppComponent} from '../app.component';
import {Constants} from '../model/Constants';

@Injectable()
export class SpinnerHttpInterceptor implements HttpInterceptor {

  logger: Logger = LoggerFactory.getLogger('SpinnerHttpInterceptor');
  count = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    this.logger.info(req.headers.get('x-call-tracking-token'));
    this.sendMessage(true, req.headers.get('x-call-tracking-token'));
    this.count++;

    return next.handle(req)

      .pipe(finalize(() => {

          this.count--;

          if (this.count === 0) {
            // this.logger.info('this.spinner.hide();');
            this.sendMessage(false, req.headers.get('x-call-tracking-token'));

          }
        })
      );
  }

  sendMessage(data: boolean, trackingToken?: string): void {
    AppComponent.generalService.sendMessage(Constants.RECEIVER_ID_SPINNER, {show: data, trackingToken: trackingToken});
  }
}
