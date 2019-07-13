export class ClientData {
  private _uniqueNumber: string;
  private _uniqueId: string;
  private _registerNumber: string;
  private _clientName: string;
  private _clientStatus: string;

  public isClientActive(): boolean {
    return this._clientStatus === 'Y';
  }


  get uniqueNumber(): string {
    return this._uniqueNumber;
  }

  set uniqueNumber(value: string) {
    this._uniqueNumber = value;
  }

  get uniqueId(): string {
    return this._uniqueId;
  }

  set uniqueId(value: string) {
    this._uniqueId = value;
  }

  get registerNumber(): string {
    return this._registerNumber;
  }

  set registerNumber(value: string) {
    this._registerNumber = value;
  }

  get clientName(): string {
    return this._clientName;
  }

  set clientName(value: string) {
    this._clientName = value;
  }

  get clientStatus(): string {
    return this._clientStatus;
  }

  set clientStatus(value: string) {
    this._clientStatus = value;
  }
}
