import { inject, Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { lastValueFrom, timeout } from 'rxjs'
import { APP_CONFIG } from '../config/config.service'

@Injectable({ providedIn: 'root' })
export class ServiceAvailabilityService {
  private readonly http = inject(HttpClient)

  async ensureAvailable(): Promise<void> {
    const url = new URL('/pupil-service-availability', APP_CONFIG.adminBaseUrl).toString()
    let state: unknown
    try {
      state = await lastValueFrom(this.http.get<unknown>(url).pipe(timeout(10_000)))
    } catch (error) {
      throw new HttpErrorResponse({
        error,
        status: 503,
        statusText: 'Unable to check service availability',
        url
      })
    }
    if (typeof state !== 'object' || state === null || !('isEnabled' in state) ||
        typeof state.isEnabled !== 'boolean') {
      throw new HttpErrorResponse({
        error: { error: 'Invalid service availability response' },
        status: 503,
        statusText: 'Unable to check service availability',
        url
      })
    }
    if (state.isEnabled) {
      throw new HttpErrorResponse({
        error: {
          error: 'Service temporarily unavailable',
          code: 'EMERGENCY_OFF_SWITCH_ENABLED'
        },
        status: 503,
        statusText: 'Service temporarily unavailable',
        url
      })
    }
  }
}
