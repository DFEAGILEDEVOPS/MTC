import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { WindowRefService } from '../window-ref/window-ref.service';

@Injectable()
export class DeviceService {
  private window;

  constructor(private storageService: StorageService,
              private windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow;
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
    const userAgent = this.window.navigator.userAgent;
    return userAgent.indexOf('MSIE') >= 0;
  }
}
