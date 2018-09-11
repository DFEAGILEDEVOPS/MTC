import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from '../device/device.service';

@Injectable()
export class ConnectionTestService {
  private timeoutSeconds = 30;
  private fibonacciN = 10000;
  private fibonacciIterations = 50000;
  private processingTime = -1;
  private connectionSpeed = -1;

  constructor(private http: HttpClient,
              private deviceService: DeviceService) {}

  async startTest() {
    await Promise.all([
      this.benchmarkProcessing(),
      this.benchmarkConnection()
    ]);

    const testResults = await this.getTestResults();
    this.submitTest(testResults);
  }

  async getTestResults(): Promise<object> {
    return {
      device: {
        battery: await this.deviceService.getBatteryInformation(),
        cpu: this.deviceService.getCpuInformation(),
        navigator: this.deviceService.getNavigatorProperties(),
        networkConnection: this.deviceService.getNetworkInformation(),
        screen: this.deviceService.getScreenProperties(),
      },
      processingTime: this.processingTime,
      connectionSpeed: this.connectionSpeed,
    };
  }

  public benchmarkProcessing(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();

      for (let i = 0; i < this.fibonacciIterations; i++) {
        this.fibonacci(this.fibonacciN);
      }

      this.processingTime = Date.now() - startTime;
      resolve();
    });
  }

  public benchmarkConnection(): Promise<void> {
    return new Promise(resolve => {
      const testUrl = `/public/images/spinner-120x120.gif?nc=${Math.random() * 5000}`;
      const startTime = Date.now();

      this.http.get(testUrl, { responseType: 'text', observe: 'response' }).subscribe((resp: any) => {
        const requestSize = resp.headers.keys().includes('content-length')
          ? resp.headers.get('content-length')
          : resp.body.length;

        const endTime = Date.now();
        this.connectionSpeed = ((requestSize * 8) / ((endTime - startTime) / 1000)) / 1024;
        resolve();
      });
    });
  }

  private submitTest(testResults: object): void {

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
}
