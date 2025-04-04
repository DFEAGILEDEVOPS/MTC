import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { WindowRefService } from '../window-ref/window-ref.service';
import { v4 as uuidv4 } from 'uuid';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class DeviceService {
  private window;
  private readonly deviceCookieName = 'mtc_device';
  private readonly deviceCookiePath = '/';

  constructor(private storageService: StorageService,
              private windowRefService: WindowRefService,
              private cookieService: CookieService) {
    this.window = this.windowRefService.nativeWindow;
  }

  /**
   * Capture device details to localStorage
   * @return {Promise<void>}
   */
  async capture() {
    this.storageService.setDeviceData(
      {
        battery: await this.getBatteryInformation(),
        cpu: this.getCpuInformation(),
        navigator: this.getNavigatorProperties(),
        networkConnection: this.getNetworkInformation(),
        screen: this.getScreenProperties(),
        deviceId: this.getDeviceId()
      });
  }

  getNavigatorProperties() {
    const nav = this.window.navigator;
    return {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      cookieEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack
    };
  }

  getScreenProperties() {
    return {
      screenWidth: this.window.screen.width,
      screenHeight: this.window.screen.height,
      outerWidth: this.window.outerWidth,
      outerHeight: this.window.innerHeight,
      innerWidth: this.window.innerWidth,
      innerHeight: this.window.innerHeight,
      colorDepth: this.window.screen.colorDepth,
      orientation: this.getOrientation()
    };
  }

  /**
   * Warning: experimental - limited support
   */
  getOrientation() {
    const orientation = this.window.screen.orientation || this.window.screen.mozOrientation || this.window.screen.msOrientation;
    if (orientation) {
      return orientation.type;
    }
  }

  /**
   * Warning: limited support (Chrome, FF)
   * @return {{hardwareConcurrancy: any}}
   */
  getCpuInformation() {
    const processors = this.window.navigator.hardwareConcurrency;
    if (!processors) {
      return;
    }

    return {
      hardwareConcurrency: processors
    };
  }

  /**
   * The BatteryAPI is only implemented in Chrome, and may be removed.
   * @return {Promise<{}>}
   */
  async getBatteryInformation() {
    if (!this.window.navigator.getBattery) {
      return;
    }
    const batteryManager = await this.window.navigator.getBattery();
    return {
      isCharging: batteryManager.charging,
      levelPercent: Math.round(batteryManager.level * 100),
      chargingTime: batteryManager.chargingTime,
      dischargingTime: batteryManager.dischargingTime
    };
  }

  /**
   * Warning: navigator.connection is experimental
   * Supported by Chrome 61 & Opera 48
   * @return {{downlink: any; effectiveType: any; rtt: any; type}}
   */
  getNetworkInformation() {
    const con = this.window.navigator.connection;
    if (!con) {
      return;
    }

    return {
      downlink: con.downlink,
      effectiveType: con.effectiveType,
      rtt: con.rtt,
      type: con.type
    };
  }

  /**
   * Determines whether the browser used is IE9,IE10
   * @return {Boolean}
   */
  isUnsupportedBrowser(): boolean {
    // Detect IE 10 and older
    const userAgent = this.window.navigator.userAgent;
    if(userAgent.indexOf('MSIE') >= 0) {
      return true // IE10 and older are unsupported
    }

    // Detect IE11
    const trident = userAgent.indexOf('Trident/')
    if (trident > 0) {
      return true // IE11 unsupported
    }

    return false // other browsers are supported
  }


  isLocalStorageEnabled(): boolean {
    try {
      if (!('localStorage' in this.window)) {
        console.error('LS01: Local storage is not enabled.  Please enable it to proceed with the MTC check.')
        return false
      }
      if (!('setItem' in this.window.localStorage)) { return false }
      if (!('getItem' in this.window.localStorage)) { return false }
    } catch {
      console.error('LS02: Local storage is not enabled.  Please enable it to proceed with the MTC check.')
      return false
    }
    const key = 'mtcLocalStorageTest'
    const testVal = uuidv4()
    try {
      this.window.localStorage.setItem(key, testVal)
    } catch {
      console.error('LS03: Local storage is not working.  Please enable it to proceed with the MTC check.')
      return false
    }
    try {
      const readTestVal = this.window.localStorage.getItem(key)
      if (readTestVal === testVal) {
        return true
      }
    } catch {
      console.error('LS04: Local storage is not working.  Please enable it to proceed with the MTC check.')
      return false
    }
    console.error('LS05: Local storage is not reliable.  Please enable it to proceed with the MTC check.')
    return false
  }

  /**
   * Return the device id string (a UUID) from the cookie
   */
  public getDeviceId(): string | null {
    const deviceId = this.cookieService.get(this.deviceCookieName);
    return deviceId ?? null;
  }

  /**
   * Set a new device id, or refresh the far-future expiry of the existing cookie.
   */
  public setupDeviceCookie (): void {
    const fourWeeksFromNow = new Date();
    fourWeeksFromNow.setTime(fourWeeksFromNow.getTime() + (28 * 24 * 60 * 60 * 1000));
    let deviceId: string;

    if (!this.cookieService.check(this.deviceCookieName)) {
      // No device cookie found
      deviceId = uuidv4();
    } else {
      deviceId = this.cookieService.get(this.deviceCookieName);
    }

    this.cookieService.set(this.deviceCookieName, deviceId, {
      path: this.deviceCookiePath,
      expires: fourWeeksFromNow,
      sameSite: 'Strict'
    });
  }

  // Useful for tests
  public deleteDeviceCookie (): void {
    this.cookieService.delete(this.deviceCookieName);
  }
}
