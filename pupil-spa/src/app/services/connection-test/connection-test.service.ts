import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../config/config.service';
import { DeviceService } from '../device/device.service';
import { StorageService } from '../storage/storage.service';
import { AzureQueueService } from '../../services/azure-queue/azure-queue.service';
import { WindowRefService } from '../window-ref/window-ref.service';

declare let AzureStorage: any;

@Injectable()
export class ConnectionTestService {
  private readonly queueName = APP_CONFIG.testSasQueueName;
  private readonly timeoutInSeconds = 30;
  private readonly fibonacciN = 10000;
  private readonly fibonacciIterations = 5000;
  private readonly downloadTimeTimeout = 8 * 1000; // 8 seconds
  private readonly filesSizes = [
    // the maximum filesize that will be downloaded is the last one in the list
    '128kb', '256kb', '512kb', '1mb', '2mb', '4mb'// , '8mb', '16mb', '32mb', '64mb', '128mb'
  ];
  private processingTime = -1;
  private connectionSpeed = -1;
  private testTimeout;
  private testRunning = true;

  constructor(private http: HttpClient,
              private router: Router,
              private storageService: StorageService,
              private deviceService: DeviceService,
              private queueService: AzureQueueService,
              private windowRefService: WindowRefService) {}

  async startTest() {
    const _window = this.windowRefService.nativeWindow;

    this.testTimeout = _window.setTimeout(() => {
      this.testRunning = false;
      this.storageService.setItem('test_status', false);
      this.router.navigate(['/ict-survey/test-completed']);
    }, this.timeoutInSeconds * 1000);

    await Promise.all([
      this.benchmarkProcessing(),
      this.benchmarkConnection()
    ]);

    const testResults = await this.getTestResults();

    // exit without submitting if the test is not running anymore (timeout)
    if (!this.testRunning) {
      return;
    }

    try {
      await this.submitTest(testResults);
      this.storageService.setItem('test_status', true);
    } catch (e) {
      this.storageService.setItem('test_status', false);
    }

    _window.clearTimeout(this.testTimeout);
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
        localStorageEnabled: this.deviceService.getLocalStorageStatus(),
      },
      processingTime: this.processingTime,
      connectionSpeed: this.connectionSpeed,
    };
  }

  public benchmarkProcessing(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();

      for (let i = 0; i < this.fibonacciIterations; i++) {
        // stop the fibonacci computing if the test is not running
        if (!this.testRunning) {
          break;
        }
        this.fibonacci(this.fibonacciN);
      }

      this.processingTime = Date.now() - startTime;
      resolve();
    });
  }

  private getFileUrl(fileSize: string): string {
    // strip the trailing '/' if there is any
    const connectionTestBlobUrl = APP_CONFIG.connectionTestBlobUrl.replace(/\/$/, '');

    return `${connectionTestBlobUrl}/${APP_CONFIG.connectionTestBlobStorageName}/${fileSize}.text?nocache=${(new Date()).getTime()}`;
  }

  private requestFile(url: string): Promise<any> {
    const startTime = Date.now();

    return this.http
      .get(url, { responseType: 'text', observe: 'response' })
      .pipe(
        map((resp: any) => {
          const fileSize = resp.headers.keys().includes('content-length')
            ? resp.headers.get('content-length')
            : resp.body.length;
          const downloadTime = Date.now() - startTime;

          return { downloadTime, fileSize };
        })
      )
      .toPromise();
  }

  public benchmarkConnection(): Promise<any> {
    return new Promise(async (resolve) => {
      let downloadTime, currentFileSize, multiplier;
      let maxRetries = 3;

      for (let i = 0; i < this.filesSizes.length; i++) {
        // stop download attempts if the test is not running
        if (!this.testRunning) {
          break;
        }
        if (maxRetries === 0) {
          maxRetries = 3;
          continue;
        }

        // dealing with kb or mb
        multiplier = this.filesSizes[i].endsWith('kb') ? 1024 : 1024 * 1024;
        const fileUrl = this.getFileUrl(this.filesSizes[i]);

        let data;
        try {
          data = await this.requestFile(fileUrl);
        } catch (e) {
          continue;
        }

        currentFileSize = parseInt(this.filesSizes[i].replace(/\D/g, ''), 10);
        downloadTime = data.downloadTime;

        if (downloadTime >= this.downloadTimeTimeout) {
          break;
        }

        // retry downloading the file if the fileSize doesn't correspond
        // to what we expected here
        if (data.fileSize !== multiplier * currentFileSize) {
          i--;
          maxRetries--;
        }
      }

      this.connectionSpeed = currentFileSize * multiplier / downloadTime;
      resolve();
    });
  }

  private submitTest(testResults: object): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.queueName === '') {
        return reject();
      }

      const message = JSON.stringify(testResults);

      const queueService = this.queueService.getQueueService(
        APP_CONFIG.testSasUrl,
        APP_CONFIG.testSasToken
      );

      const encodedMessage = this.queueService.encodeMessage(message);
      queueService.createMessage(this.queueName, encodedMessage, function (error, result, response) {
        if (error) {
          return reject();
        }

        resolve();
      });
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
}
