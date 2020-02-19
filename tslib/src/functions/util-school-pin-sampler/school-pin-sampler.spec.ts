import { SchoolPinSampler } from './school-pin-sampler'
import moment = require('moment')

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
})
