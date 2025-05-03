// communication.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private helperIdSource = new BehaviorSubject<number | null>(null);
  helperId$ = this.helperIdSource.asObservable();
  private currentHelperIdSubject = new BehaviorSubject<number | null>(null);
  currentHelperId$ = this.currentHelperIdSubject.asObservable();
  private chatPopupSubject = new Subject<{ conversationId: number, helperId: number, orderId: number }>();
chatPopup$ = this.chatPopupSubject.asObservable();

openChatPopup(data: { conversationId: number, helperId: number, orderId: number }) {
  this.chatPopupSubject.next(data);
}
  openChatWith(helperId: number) {
    this.helperIdSource.next(helperId);
  }
  closeChat() {
    this.currentHelperIdSubject.next(null);}
  reset() {
    this.helperIdSource.next(null);
  }
}
