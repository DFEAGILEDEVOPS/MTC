'use strict'
/* global describe, expect, it */

const detectLowBattery = require('../../service/detections/detect-low-battery')

describe('#lowBattery', () => {
  it('reports low battery', () => {
    const res = detectLowBattery({
      checkPayload: {
        device: {
          battery: {
            isCharging: false,
            levelPercent: 19
          }
        }
      }
    })
    expect(res.Message).toBe('Low battery')
  })

  it('does not report low battery if it is low but charging', () => {
    const res = detectLowBattery({
      checkPayload: {
        device: {
          battery: {
            isCharging: true,
            levelPercent: 19
          }
        }
      }
    })
    expect(res).toBe(undefined)
  })

  it('does not report low battery the level is not low', () => {
    const res = detectLowBattery({
      checkPayload: {
        device: {
          battery: {
            isCharging: false,
            levelPercent: 20
          }
        }
      }
    })
    expect(res).toBe(undefined)
  })

  it('does not report low battery if the info is missing', () => {
    const res = detectLowBattery({
      checkPayload: {
        device: {
          battery: {
            isCharging: true,
            levelPercent: 20
          }
        }
      }
    })
    expect(res).toBe(undefined)
  })
})
