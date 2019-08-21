import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Logger, LoggerFactory} from './logging/LoggerFactory';
import {catchError, finalize, map, tap} from 'rxjs/operators';
import {MessageBusService} from './messaging/message-bus.service';
import {Message} from './messaging/model/Message';
import {ReceiverID} from '../../utilities/ReceiverID';

@Injectable()
export class SpinnerHttpInterceptor implements HttpInterceptor {

  logger: Logger = LoggerFactory.getLogger('SpinnerHttpInterceptor');
  count = 0;

  constructor(private messageBusService: MessageBusService) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    this.logger.info(req.headers.get('x-call-tracking-token'));
    this.sendMessage(true, req.headers.get('x-call-tracking-token'));
    this.count++;

    return next.handle(req)
      .pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff with response if you want
            console.log(event.headers);
            const jwt = event.headers.get('x-call-tracking-token');
            console.log(jwt);
            // console.log(response.headers);
            // console.log(HttpResponse.Headers);

            this.count--;

            if (this.count === 0) {
              // this.logger.info('this.spinner.hide();');
              this.sendMessage(false, req.headers.get('x-call-tracking-token'));

            }
          }


        }, e => {
          if (e instanceof HttpErrorResponse) {
            this.count--;

            if (this.count === 0) {
              // this.logger.info('this.spinner.hide();');
              this.sendMessage(false, req.headers.get('x-call-tracking-token'));

            }
          }
        })
        // }),
        // finalize(() => {
        //
        //   // this.count--;
        //   //
        //   // if (this.count === 0) {
        //   //   // this.logger.info('this.spinner.hide();');
        //   //   this.sendMessage(false, req.headers.get('x-call-tracking-token'));
        //   //
        //   // }
        // })
      );

    // return next.handle(req).do((event: HttpEvent<any>) => {
    //   console.log(event);
    //   if (event instanceof HttpResponse) {
    //     // do stuff with response if you want
    //     console.log(event.headers);
    //     const jwt = event.headers.get('Autho');
    //     console.log(jwt);
    //     // console.log(response.headers);
    //     // console.log(HttpResponse.Headers);
    //   }
    // }, (err: any) => {
    //   if (err instanceof HttpErrorResponse) {
    //     console.log(err);
    //     if (err.status === 400) {
    //       // redirect to the login route
    //       // or show a modal
    //       console.log('ERROR');
    //       window.location.href = this.messageService.API_ROOT;
    //     }
    //   }
    // });
  }

  sendMessage(data: boolean, trackingToken?: string): void {
    this.messageBusService.publish(new Message(ReceiverID.RECEIVER_ID_SPINNER, {show: data, trackingToken: trackingToken}));
  }
}
