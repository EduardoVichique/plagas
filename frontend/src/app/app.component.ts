import { Component, OnInit } from '@angular/core';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  template: '<ion-app><ion-router-outlet></ion-router-outlet><app-loading></app-loading></ion-app>',
  styles: [],
})
export class AppComponent implements OnInit {
  constructor(private loadingService: LoadingService) { }

  ngOnInit() {
    setTimeout(() => {
      this.loadingService.hide();
    }, 1500);
  }
}
