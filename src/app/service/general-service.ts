import { Injectable } from '@angular/core';
import { GeneralServiceDTO } from '../model/generalServiceDTO';
import {BehaviorSubject, Observable} from 'rxjs';

/**
 * using GeneralServiceDTO.receiverId to determine who should consume the message sent
 */
@Injectable()
export class GeneralService {
  private subject: BehaviorSubject<GeneralServiceDTO> = new BehaviorSubject<GeneralServiceDTO>(new GeneralServiceDTO(null, null));

  sendMessage(receiverId: string, data: any): void {
    let message: GeneralServiceDTO;
    message = new GeneralServiceDTO(receiverId, data);
    this.subject.next(message);
  }

  getMessage(): Observable<GeneralServiceDTO> {
    return this.subject.asObservable();
  }
}

