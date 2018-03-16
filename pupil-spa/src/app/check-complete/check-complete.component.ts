import { Component, OnInit, AfterViewInit } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-check-complete',
  templateUrl: './check-complete.component.html',
  styleUrls: ['./check-complete.component.css']
})
export class CheckCompleteComponent implements OnInit {

  protected window: any;

  constructor(private storageService: StorageService, protected windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.storageService.clear();
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/check-complete'
    });
  }

}
