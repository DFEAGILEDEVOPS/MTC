import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WindowRefService } from '../window-ref/window-ref.service';

@Injectable()
export class ConnectionTestService {
  private windowObj;
  private timeout = 3000;
  private fibonacciN = 10000;
  private processingTime = -1;
  private connectionSpeed = -1;

  constructor(private http: HttpClient,
              private windowRef: WindowRefService) {
    this.windowObj = windowRef.nativeWindow;
  }

  public startTest() {
    // setTimeout needed as 'rendering' seems to be blocked in some browsers otherwise
    setTimeout(() => this.benchmarkProcessing(), 1);

    this.benchmarkConnection();
  }

  public getTestResults(): object {
    return {
      ...this.getBrowserData(),
      processingTime: this.processingTime,
      connectionSpeed: this.connectionSpeed,
    };
  }

  public benchmarkProcessing(): void {
    const startTime = Date.now();

    for (let i = 0; i < 50000; i++) {
      this.fibonacci(this.fibonacciN);
    }

    this.processingTime = Date.now() - startTime;
  }

  public benchmarkConnection(): void {
    const testUrl = `/public/images/spinner-120x120.gif?nc=${Math.random() * 5000}`;
    const startTime = Date.now();

    this.http.get(testUrl, { responseType: 'text', observe: 'response' }).subscribe((resp: any) => {
      const requestSize = resp.headers.keys().includes('content-length')
        ? resp.headers.get('content-length')
        : resp.body.length;

      const endTime = Date.now();
      this.connectionSpeed = ((requestSize * 8) / ((endTime - startTime) / 1000)) / 1024;
    });
  }

  private fibonacci(n: number): number {
    let fn = 0;
    let f1 = 0;
    let f2 = 1;

    for (let i = 2; i <= n; i++) {
      fn = f1 + f2;
      f1 = f2;
      f2 = fn;
    }

    return fn;
  }

  private getBrowserData(): object {
    const window = this.windowObj;

    const data = {
      browser: {
        userAgent: window.navigator.userAgent,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      },
      os: {
        platform: window.navigator.platform
      }
    };

    return data;
  }

}
