export class LoggerFactory {

  static getLogger(name: string): Logger {
    return new Logger(name);
  }
}

export class Logger {
  private name = 'Logger';

  constructor(name: string) {
    this.name = name;
  }

  info(text: any, value?: string): void {
    console.log(text);
  }

  error(text: any): void {
    console.log(text);
  }

  debug(key: any, text: any): void {
    console.log(key + ' - ' + text);
  }
}
