import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import * as polly from 'polly-js';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private readonly defaultRetryCount = 5
  /**
   * Provide HTTP with a client retry by default
   */
  constructor(private http: HttpClient) { }

  private config = {
    retryTimes: this.defaultRetryCount
  };

  /**
   * Simple HTTP service that retries by default
   * @param {string} url
   * @param {object} body
   * @returns - whatever the URL returns on success
   * @throws HttpErrorResponse - the app error from the server is in error.error - check `error.status` for the HTTP status code.
   */
   public async postXml(url: string, body: any, headers: HttpHeaders, retryCount = this.defaultRetryCount): Promise<any> {
    try {
      const _that = this;
      _that.config.retryTimes = retryCount;
      return _that.http.request('POST', url, {
        headers: headers.set('Content-Type', 'text/xml'),
        body: body,
        responseType: 'text'
      }).toPromise()
    } catch (error) {
      console.error(`http request error: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Simple HTTP service that retries by default
   * @param {string} url
   * @param {object} body
   * @returns - whatever the URL returns on success
   * @throws HttpErrorResponse - the app error from the server is in error.error - check `error.status` for the HTTP status code.
   */
  public async postJson(url: string, body: any): Promise<any> {
    try {
      return this.doPost(url, body, this.config.retryTimes, new HttpHeaders( { 'Content-Type': 'application/json' }));
    } catch (error) {
      console.log(`http post error: status was ${error.status} - ${error.message}`, error);
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

  private async doPost(url: string, body: any, retryCount: number, headers: HttpHeaders): Promise<any> {
    const options = {
      headers: headers
    };
    const _that = this;
    _that.config.retryTimes = retryCount;
    const response = await polly()
      .handle(error => {
        // Any requests that don't give a 200 status code will raise an Exception that can be handled here.
        // Any errors worth re-trying can be detected here.
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
        return false; // shouldn't get here
      })
      .waitAndRetry(_that.config.retryTimes)
      .executeForPromise(function () {
        return _that.http.post(url, body, options).toPromise();
      });
    return response;
  }
}
