import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { map, tap, last } from 'rxjs/operators';
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
  private connectionTestResult: number;
  private filesSizes = [
    '128kb', '512kb', '1mb', '2mb', '4mb', '8mb', '16mb', '32mb', '64mb', '128mb'
  ];

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

  private getFileUrl(fileSize: string): string {
    return `${APP_CONFIG.testSasUrl}/connection-test/data/${fileSize}.text`
  }

  requestFile(url: string) {
    return new Promise(resolve => {
      const startTime = Date.now();

      this.http.get(url, { responseType: 'text', observe: 'response' }).subscribe((resp: any) => {
        const fileSize = resp.headers.keys().includes('content-length')? resp.headers.get('content-length'): resp.body.length;
        const downloadTime = Date.now() - startTime;

        resolve({downloadTime, fileSize});
      });
    });
  }

  async benchmarkConnection(fileSizeIndex: number = 0) {
    const currentFile     = this.filesSizes[fileSizeIndex];
    const fileUrl         = this.getFileUrl(this.filesSizes[fileSizeIndex]);
    const currentFileSize = parseInt(this.filesSizes[fileSizeIndex].replace(/\D/g, ''), 10);
    const multiplier      = (fileSizeIndex < 2) ? 1024 : 1048576;

    const { downloadTime,  fileSize } = await this.requestFile(fileUrl)
      
    if (downloadTime < 8000 && currentFileSize * multiplier !== fileSize) {
      this.benchmarkConnection(fileSizeIndex);
    } else if (downloadTime < 8000){
      this.benchmarkConnection(++fileSizeIndex);
    } else {
      Math.floor((currentFileSize / downloadTime) * 8000); 
    }
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
