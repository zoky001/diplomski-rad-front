export class TenorValidation {
  public static DATE: TenorValidation = new TenorValidation('[0-9]{2}[.]{1}[0-9]{2}[.]{1}[0-9]{4}[.]?', 'U polje Tenor može se unijeti samo datum.'); // Dozvoljeno je dd.mm.yyyy i dd.mm.yyyy.
  public static DATE_STRING: TenorValidation = new TenorValidation('[0-9]{2}[.]{1}[0-9]{2}[.]{1}[0-9]{4}.*', 'U polje Tenor prvo se mora unijeti datum, a zatim se može unijeti tekst.');
  private _regularExpression: string;
  private _errorMessage: string;


  constructor(regularExpression: string, errorMessage: string) {
    this._regularExpression = regularExpression;
    this._errorMessage = errorMessage;
  }

  get regularExpression(): string {
    return this._regularExpression;
  }

  set regularExpression(value: string) {
    this._regularExpression = value;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  set errorMessage(value: string) {
    this._errorMessage = value;
  }
}
