import { Injectable } from '@angular/core'
import { ApplicationInsights, IExceptionTelemetry, ITelemetryItem } from '@microsoft/applicationinsights-web'
import { Router, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs/operators'
import { APP_CONFIG } from '../config/config.service'
import { Meta } from '@angular/platform-browser'
import { StorageService } from '../storage/storage.service'

export interface MtcCustomProperties {
  mtcCheckCode: string
  mtcSchoolUUID: string
  mtcSpaBuildNumber: string
  mtcCommitId: string
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationInsightsService {
  private appInsights: ApplicationInsights
  private buildNumber: string
  private commitId: string


  constructor (private router: Router, private meta: Meta, private storageService: StorageService) {
    if (!APP_CONFIG.applicationInsightsInstrumentationKey) {
      return
    }

    this.appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: APP_CONFIG.applicationInsightsInstrumentationKey
      }
    })

    this.appInsights.loadAppInsights()
    this.loadCustomTelemetryProperties()
    this.createRouterSubscription()
  }

  setUserId (userId: string) {
    if (!this.appInsights) {
      return
    }
    this.appInsights.setAuthenticatedUserContext(userId)
  }

  clearUserId () {
    if (!this.appInsights) {
      return
    }
    this.appInsights.clearAuthenticatedUserContext()
  }

  trackPageView (name?: string, uri?: string) {
    if (!this.appInsights) {
      return
    }
    const customTracking = this.getCustomProperties()
    this.appInsights.trackPageView({ name, uri, properties: customTracking })
  }

  trackException (error: Error) {
    if (!this.appInsights) {
      return
    }
    const exception: IExceptionTelemetry = {
      exception: error
    }
    const customTracking = this.getCustomProperties()
    this.appInsights.trackException(exception, customTracking)
  }

  trackTrace(message: string) {
    if (!this.appInsights) {
      console.debug(message)
      return
    }
    const customTracking = this.getCustomProperties()
    this.appInsights.trackTrace({ message, properties: customTracking })
  }

  getCustomProperties (): MtcCustomProperties {
    return {
      mtcCheckCode: this.storageService.getPupil()?.checkCode,
      mtcSchoolUUID: this.storageService.getSchool()?.uuid,
      mtcSpaBuildNumber: this.getBuildNumber(),
      mtcCommitId: this.getCommitId()
    }
  }

  private getBuildNumber (): string {
    if (this.buildNumber === undefined) {
      this.buildNumber = this.meta.getTag('name="build:number"').content
    }
    return this.buildNumber
  }

  private getCommitId (): string {
    if (this.commitId === undefined) {
      this.commitId = this.meta.getTag('name="build:commitId"').content
    }
    return this.commitId
  }

  public loadCustomTelemetryProperties () {
    const mtcTelemetryInitializer = (envelope: ITelemetryItem) => {
      const baseData = envelope.data
      const customProps = this.getCustomProperties()
      for (const [key, val] of Object.entries(customProps)) {
        baseData[key] = val
      }
    }
    this.appInsights.addTelemetryInitializer(mtcTelemetryInitializer)
  }

  private createRouterSubscription () {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.trackPageView(null, event.urlAfterRedirects)
    })
  }
}
