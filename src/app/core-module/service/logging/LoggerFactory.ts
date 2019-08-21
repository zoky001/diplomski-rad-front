import {AppConfig} from '../config/app.config';

export class LoggerFactory {

  static getLogger(name: string): Logger {
    return new Logger(name);
  }


}

export class Logger {
  private name = 'Logger';

  protected loggingConsole = true;
  protected loggingConsoleInfo = true;
  protected loggingConsoleError = true;
  protected loggingConsoleDebug = true;

  constructor(name: string) {
    this.name = name;

    if (AppConfig.settings) {
      this.loggingConsole = AppConfig.settings.logging.console;
      this.loggingConsoleInfo = AppConfig.settings.logging.info;
      this.loggingConsoleError = AppConfig.settings.logging.error;
      this.loggingConsoleDebug = AppConfig.settings.logging.debug;
    }

  }

  info(text: any, value?: string): void {
    if (this.loggingConsole && this.loggingConsoleInfo) {
      console.log(text);
    }
  }

  error(text: any): void {
    if (this.loggingConsole && this.loggingConsoleError) {
      console.error(text);
    }
  }

  debug(key: any, text: any): void {
    if (this.loggingConsole && this.loggingConsoleDebug) {
      console.log(key + ' - ' + text);
    }
  }
}
