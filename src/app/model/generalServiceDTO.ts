/**
 * to be used with obervable sendMessage method, receiverId defines the intended consumer of the message
 */
export class GeneralServiceDTO {
    public receiverId: string;
    public data: any;

    constructor(receiverId: string, data: any) {
        this.receiverId = receiverId;
        this.data = data;
    }
}
