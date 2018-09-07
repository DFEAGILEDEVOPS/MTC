import { Component, OnInit} from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-connection-test',
  templateUrl: './connection-test.component.html',
  styleUrls: ['./connection-test.component.scss']
})
export class ConnectionTestComponent implements OnInit {
  private windowObj: any;
  private timeout:number = 3000;

  constructor(
    private storage: StorageService,
    private windowRef: WindowRefService) {

    // reset the feedback and preview flags when starting the test
    this.storage.setItem('feedback_given', false);
    this.storage.setItem('preview_completed', false);

    this.windowObj = windowRef.nativeWindow;
    
    setTimeout(this.fibonacciNumbers, 3000);
  }

  ngOnInit(): void {
    this.getBrowserData();
    setTimeout(this.fibonacciNumbers, this.timeout);
  }

  getBrowserData():void {
    //browser
    console.log(this.windowObj.navigator.userAgent);
    console.log(this.windowObj.innerWidth);
    console.log(this.windowObj.innerHeight);
    console.log(this.windowObj.screen.width);
    //OS
    console.log(this.windowObj.navigator.platform);
  }

  fibonacciNumbers():void {
    let start = Date.now();

    for (let i = 0; i < 10000; i++) {
      let arr = [0, 1];
      for (let i = 2; i < 50000 + 1; i++){
        arr.push(arr[i - 2] + arr[i -1])
      }
    }
    
    console.log(Date.now() - start);
  }
}
