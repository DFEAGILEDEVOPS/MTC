import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-connection-test',
  templateUrl: './connection-test.component.html',
  styleUrls: ['./connection-test.component.scss']
})
export class ConnectionTestComponent {
  private windowObj: any;

  constructor(
    private storage: StorageService,
    private windowRef: WindowRefService) {
    // reset the feedback and preview flags when starting the test
    this.storage.setItem('feedback_given', false);
    this.storage.setItem('preview_completed', false);

    this.windowObj = windowRef.nativeWindow;
    
    this.getBrowserData();
    this.getDimensions();
    this.getOperatingSystem();
    this.getScreenWidth();

  }

  getBrowserData() {
    //console.log(this.windowObj.navigator.platform);
    console.log(this.windowObj.navigator.userAgent);
    //console.log(this.windowObj.navigator.appVersion);
    //console.log(this.windowObj.navigator.vendor);
  }

  getDimensions() {
    console.log(this.windowObj.innerWidth);
    console.log(this.windowObj.innerHeight);
  }

  getOperatingSystem() {
    console.log(this.windowObj.navigator.platform);
  }

  getScreenWidth() {
    console.log(this.windowObj.screen.width);
  }

}
