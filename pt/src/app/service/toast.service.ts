import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toast = new BehaviorSubject<Toast>({
    message: '',
    type: 'success',
    show: false
  });

  toast$ = this.toast.asObservable();

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast.next({ message, type, show: true });
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    this.toast.next({ ...this.toast.value, show: false });
  }
}
