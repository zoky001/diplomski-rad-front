export class SearchType {
  private _type: string;
  private _label: string;
  private _regex: string;
  private _validatorMessage: string;
  private _typeNumber: number;
  private _maxLength: number;


  constructor(type: string, label: string, regex: string, validatorMessage: string, typeNumber: number, maxLength: number = 30) {
    this._type = type;
    this._label = label;
    this._regex = regex;
    this._validatorMessage = validatorMessage;
    this._typeNumber = typeNumber;
    this._maxLength = maxLength;
  }

  get maxLength(): number {
    return this._maxLength;
  }

  set maxLength(value: number) {
    this._maxLength = value;
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get regex(): string {
    return this._regex;
  }

  set regex(value: string) {
    this._regex = value;
  }

  get validatorMessage(): string {
    return this._validatorMessage;
  }

  set validatorMessage(value: string) {
    this._validatorMessage = value;
  }

  get typeNumber(): number {
    return this._typeNumber;
  }

  set typeNumber(value: number) {
    this._typeNumber = value;
  }
}
