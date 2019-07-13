import { ClientData } from './client-data';

export class ClientSearchResponse {
  private _data: Array<ClientData>;
  private _message: string;
  private _status: number;
  private _exception: string;

  get data(): Array<ClientData> {
    return this._data;
  }

  set data(value: Array<ClientData>) {
    this._data = value;
  }

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }

  get status(): number {
    return this._status;
  }

  set status(value: number) {
    this._status = value;
  }

  get exception(): string {
    return this._exception;
  }

  set exception(value: string) {
    this._exception = value;
  }
}
