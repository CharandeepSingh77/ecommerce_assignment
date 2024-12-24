import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../service/toast.service';
import { Observable } from 'rxjs';
import { Toast } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  toast$!: Observable<Toast>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toast$ = this.toastService.toast$;
  }

  hideToast(): void {
    this.toastService.hideToast();
  }
}
