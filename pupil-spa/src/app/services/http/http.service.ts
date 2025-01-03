import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import * as polly from 'polly-js';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly defaultRetryCount = 5;
  private config = {
    retryTimes: this.defaultRetryCount
  };

  constructor(private http: HttpClient) {}

  /**
   * Simple HTTP service that retries by default
   * @param {string} url
   * @param {object} body
   * @returns - whatever the URL returns on success
   * @throws HttpErrorResponse - the app error from the server is in error.error - check `error.status` for the HTTP status code.
   */
  public async postJson(url: string, body: any): Promise<any> {
    try {
      return this.doPost(url, body, this.config.retryTimes, new HttpHeaders({ 'Content-Type': 'application/json' }));
    } catch (error) {
      console.error(`http post error: status was ${error.status} - ${error.message}`, error);
      throw error;
    }
  }

  public async post(url: string, body: any, headers: HttpHeaders, retryCount = this.defaultRetryCount) {
    try {
      return this.doPost(url, body, retryCount, headers);
    } catch (error) {
      console.log(`http post error: status was ${error.status} - ${error.message}`, error);
      throw error;
    }
  }

  public async postXml(url: string, body: any, headers: HttpHeaders, retryCount = this.defaultRetryCount): Promise<any> {
    const retryConfig = new Array<number>();
    const baseDelay = 3000;
    const increaseFactor = 1.5;

    retryConfig.push(baseDelay);
    for (let i = 1; i < retryCount; i++) {
      const instanceDelay = Math.round(increaseFactor * retryConfig[i - 1]);
      retryConfig.push(instanceDelay);
    }

    return polly()
      .handle((error) => this.handleError(error))
      .waitAndRetry(retryConfig)
      .executeForPromise(() =>
        lastValueFrom(this.http.request('POST', url, {
          headers: headers.set('Content-Type', 'text/xml'),
          body: body,
          responseType: 'text'
        }))
      );
  }

  private async doPost(url: string, body: any, retryCount: number, headers: HttpHeaders): Promise<any> {
    const options = {
      headers: headers
    };

    this.config.retryTimes = retryCount;

    return polly()
      .handle((error) => this.handleError(error))
      .waitAndRetry(this.config.retryTimes)
      .executeForPromise(() =>
        lastValueFrom(this.http.post(url, body, options))
      );
  }

  private handleError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        /**
         * Client-side generated events will be raised as ErrorEvents. Angular assigns these to the HttpErrorResponse.error
         * property and puts it in the generic HttpErrorResponse object.
         *
         * We may as well attempt re-try for all client side errors, as the request has not reached the server yet.
         */
        console.error('http-service: transient ErrorEvent: (will attempt retry)', error);
        return true;
      } else {
        /**
         * HttpErrorResponse handling - the remote server has provided a response
         * Retry on these failures for Azure:
         */
        switch (error.status) {
          case 0: /* unknown error, http failure, like CORS */
          case 408: /* Request timeout */
          case 429: /* Too many requests */
          case 500: /* Server error */
          case 502: /* Bad gateway */
          case 503: /* Service unavailable */
          case 504: /* Gateway timeout */
            console.error('http-service: error: (will attempt retry):', error);
            return true;
          default:
            /**
             * Don't retry for other error codes.
             */
            console.error('http-service: (will not retry)', error);
            return false;
        }
      }
    }
    console.warn('http-service: error: unusual error response (will not retry):', error);
    return false;
  }
}
