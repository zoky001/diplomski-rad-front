import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {AppConfig} from '../config/app.config';
import {ReceiverID} from '../../../utilities/ReceiverID';
import {Message} from '../messaging/model/Message';
import {MessageBusService} from '../messaging/message-bus.service';


@Injectable()
export class HttpService {

  protected apiServer = AppConfig.settings.apiServer;

  constructor(private http: HttpClient,
              private messageBus: MessageBusService) {

  }

  submitGetRequestAndReturnData<T>(options: {
    serviceUrl: string,
    parseResponse?: boolean,
    additionalHeaders?: Headers,
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {

    const options1 = this.setTrackingTokenHeader(options.additionalHeaders);


    return this.http.get<any>(this.apiServer + options.serviceUrl, options1)
      .pipe(
        catchError(e => {
          this.sendMessage(ReceiverID.RECEIVER_ID_SHOW_MESSAGE, {'title': 'Greška kod poziva WEB SERVISA', 'message': 'Nema odgovora servisa!'});

          return throwError(e);
        })
        ,
        map(data => {
          return this.processResponse(options.parseResponse, data);
        })
      );


  }

  submitRequestAndReturnData<T>(options: {
    serviceUrl: string,
    body: any,
    parseResponse?: boolean,
    additionalHeaders?: Headers,
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    observe?: 'events';
    params?: HttpParams | {
      [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {

    const options1 = this.setTrackingTokenHeader(options.additionalHeaders);

    return this.http.post<Response>(this.apiServer + options.serviceUrl, options.body, options1)
      .pipe(
        catchError(e => {
          this.sendMessage(ReceiverID.RECEIVER_ID_SHOW_MESSAGE, {'title': 'Greška kod poziva WEB SERVISA', 'message': 'Nema odgovora servisa!'});

          return throwError(e);
        })
        ,
        map(data => {
          return this.processResponse(options.parseResponse, data);
        })
      );

  }

  private processResponse<T>(parseResponse: boolean, data: Response): T {
    try {

      if (data.success) {
        if (parseResponse) {
          const res: T = data.data as T;
          return res;
        } else {
          return data.data;
        }
      } else {

        const message: string = data.errorMessageTextList[0] ? data.errorMessageTextList[0] : '';
        this.sendMessage(ReceiverID.RECEIVER_ID_SHOW_MESSAGE, {'title': 'Greška kod poziva WEB SERVISA', 'message': message});
        throw new Error('Greška kod poziva WEB SERVISA');
      }

    } catch (e) {

    }
  }

  private setTrackingTokenHeader(additionalHeaders: Headers) {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('x-call-tracking-token', additionalHeaders.get('x-call-tracking-token') as string);

    const options1 = {
      headers: headers
    };
    return options1;
  }

  protected sendMessage(code: string, data: any) {
    const message: Message = new Message(code, data);
    this.messageBus.publish(message);
  }
}


export class Response {
  success: boolean;
  data: any;
  errorMessageCodeList: string[];
  errorMessageTextList: string[];
}
