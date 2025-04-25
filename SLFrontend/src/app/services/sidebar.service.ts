import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _isOpen = new BehaviorSubject<boolean>(true);
  
  toggle() {
    this._isOpen.next(!this._isOpen.value);
  }
  
  get isOpen$() {
    return this._isOpen.asObservable();
  }
}