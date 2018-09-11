import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../config/config.service';
import { DeviceService } from '../device/device.service';
import { StorageService } from '../storage/storage.service';

declare let AzureStorage: any;

@Injectable()
export class ConnectionTestService {
  private readonly queueName = APP_CONFIG.testSasQueueName;
  private timeoutSeconds = 30;
  private fibonacciN = 10000;
  private fibonacciIterations = 50000;
  private processingTime = -1;
  private connectionSpeed = -1;

  constructor(private http: HttpClient,
              private router: Router,
              private storageService: StorageService,
              private deviceService: DeviceService) {}

  async startTest() {
    await Promise.all([
      this.benchmarkProcessing(),
      this.benchmarkConnection()
    ]);

    const testResults = await this.getTestResults();

    try {
      await this.submitTest(testResults);
      this.storageService.setItem('test_status', true);
    } catch (e) {
      this.storageService.setItem('test_status', false);
    }

    this.router.navigate(['/ict-survey/test-completed']);
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
      const connectionTestFile = APP_CONFIG.connectionTestFile;
      const testUrl = `${connectionTestFile}?nc=${Math.random() * 5000}`;
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

  private submitTest(testResults: object): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.queueName === '') {
        return reject();
      }

      const queueService = this.getQueueService();
      const encoder = new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder();

      const message = JSON.stringify(testResults);
      const encodedMessage = encoder.encode(message);
      queueService.createMessage(this.queueName, encodedMessage, function (error, result, response) {
        if (error) {
          return reject();
        }

        resolve();
      });
    });
  }

  private getQueueService() {
    return AzureStorage.Queue.createQueueServiceWithSas(
      APP_CONFIG.testSasUrl,
      APP_CONFIG.testSasToken
    ).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter());
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
