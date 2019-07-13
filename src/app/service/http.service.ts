import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';


@Injectable()
export class HttpService {


  constructor(private http: HttpClient) {
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
    if (options.parseResponse) {
      return this.http.get<any>('http://localhost:8080/' + options.serviceUrl)
        .pipe(
          // catchError(this.handleError('getHeroes', []))
          catchError(e => {
            return throwError(e);
          })
          ,
          map(data => {
            const res: T = data.data as T;
            return res;
          })
        );
    } else {
      return this.http.get<any>('http://localhost:8080/' + options.serviceUrl)
        .pipe(
          // catchError(this.handleError('getHeroes', []))
          catchError(e => {
            return throwError(e);
          })
          ,
          map(data => {
            return data;
          })
        );
    }

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

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('x-call-tracking-token', options.additionalHeaders.get('x-call-tracking-token') as string);

    const options1 = {
      headers: headers
    };
    if (options.parseResponse) {
      return this.http.post<any>('http://localhost:8080/' + options.serviceUrl, options.body, options1)
        .pipe(
          // catchError(this.handleError('addHero', hero))
          catchError(e => {
            return throwError(e);
          })
          ,
          map(data => {
            const res: T = data.data as T;
            return res;
          })
        );
    } else {
      return this.http.post<any>('http://localhost:8080/' + options.serviceUrl, options.body)
        .pipe(
          // catchError(this.handleError('addHero', hero))
          catchError(e => {
            return throwError(e);
          })
          ,
          map(data => {
            return data;
          })
        );
    }


  }
}
