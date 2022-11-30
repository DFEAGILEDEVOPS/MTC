import { IWindowRefService } from './window-ref.service'

export class MockWindowRefService implements IWindowRefService {
  public mockWindow = {
      performance: {
        now: () => 123.4,
        timeOrigin: 0
      }
  }

  constructor (date: Date) {
    this.mockWindow.performance.timeOrigin = date.valueOf()
  }

  get nativeWindow(): any {
    return this.mockWindow
  }
}
