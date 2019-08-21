import {APP_INITIALIZER, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpService} from './service/http-service/http.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {SpinnerHttpInterceptor} from './service/spinner-http.interceptor';
import {MessageBusService} from './service/messaging/message-bus.service';
import {DocumentDownloadService} from './service/download/document-download.service';
import {AppConfig} from './service/config/app.config';


export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    },
    HttpService,
    MessageBusService,
    DocumentDownloadService,
    {provide: HTTP_INTERCEPTORS, useClass: SpinnerHttpInterceptor, multi: true}
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule has already been loaded. You should only import Core modules in the AppModule only.');
    }
  }
}
