export class Message {
  code: string;
  data: any;

  constructor(code: string, data: any) {
    this.code = code;
    this.data = data;
  }
}
