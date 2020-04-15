import { SchoolPinSampler } from './school-pin-sampler'
import moment = require('moment')
import { TimezoneUtil } from '../school-pin-generator/timezone-util'

let sut: SchoolPinSampler

describe('school-pin-sampler', () => {
  beforeEach(() => {
    sut = new SchoolPinSampler()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(SchoolPinSampler)
  })

  test('returns a set of generated pins equal to the size requested', () => {
    const sampleSizeRequested = 5
    const samples = sut.generateSample(sampleSizeRequested, moment.utc())
    expect(samples.length).toBe(sampleSizeRequested)
  })

  test('throws error if sample size is larger than all available timezones', () => {
    const tzUtil = new TimezoneUtil()
    const maximumSampleSize = tzUtil.getTimezoneList().length
    try {
      sut.generateSample(maximumSampleSize + 1, moment.utc())
      fail('should have thrown an error')
    } catch (error) {
      expect(error.message).toBe(`maximum sample size is ${maximumSampleSize}`)
    }
  })

  test('each sample has a pin and expiry time', () => {
    const sampleSizeRequested = 5
    const samples = sut.generateSample(sampleSizeRequested, moment.utc())
    for (let index = 0; index < sampleSizeRequested; index++) {
      const sample = samples[index]
      expect(sample.pin).toBeTruthy()
      expect(sample.pin.length).toBe(8)
      expect(sample.pinExpiresAt).toBeTruthy()
      expect(sample.timezone).toBeTruthy()
    }
  })

  test('does not randomise if not specified', () => {
    const sampleSizeRequested = 5
    const samples = sut.generateSample(sampleSizeRequested, moment.utc())
    expect(samples.length).toEqual(sampleSizeRequested)
    const tzUtil = new TimezoneUtil()
    const zones = tzUtil.getTimezoneList()
    expect(samples[0].timezone).toEqual(zones[0].name)
    expect(samples[1].timezone).toEqual(zones[1].name)
    expect(samples[2].timezone).toEqual(zones[2].name)
    expect(samples[3].timezone).toEqual(zones[3].name)
    expect(samples[4].timezone).toEqual(zones[4].name)
  })

  test('does randomise if specified', () => {
    const sampleSizeRequested = 10
    const nonRandomSamples = sut.generateSample(sampleSizeRequested, moment.utc(), false)
    const randomSamples = sut.generateSample(sampleSizeRequested, moment.utc(), true)
    expect(nonRandomSamples.length).toBe(sampleSizeRequested)
    expect(randomSamples.length).toBe(sampleSizeRequested)
    const nonRandomZones = nonRandomSamples.map(s => s.timezone).join('-')
    const randomZones = randomSamples.map(s => s.timezone).join('-')
    expect(nonRandomZones).not.toEqual(randomZones)
  })
})
