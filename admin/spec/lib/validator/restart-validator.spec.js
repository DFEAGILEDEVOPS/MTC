'use strict'
/* global describe, it, expect */
const restartValidator = require('../../../lib/validator/restart-validator')

describe('restart-validator', () => {
  describe('validateReason', () => {
    describe('returns true', () => {
      it('if reason value is did not complete and further information textarea has at least one character', async () => {
        const restartReason = 'DNC'
        const didNotCompleteInfo = '1'
        const result = restartValidator.validateReason(restartReason, didNotCompleteInfo)
        expect(result.hasError()).toBeFalsy()
      })
      it('if reason value is classroom disruption and further information textarea has at least one character', async () => {
        const restartReason = 'CLD'
        const classDisruptionInfo = '1'
        const result = restartValidator.validateReason(restartReason, classDisruptionInfo)
        expect(result.hasError()).toBeFalsy()
      })
    })
    describe('returns false', () => {
      it('if reason value is did not complete and further information textarea is empty', async () => {
        const restartReason = 'DNC'
        const didNotCompleteInfo = ''
        const result = restartValidator.validateReason(restartReason, didNotCompleteInfo)
        expect(result.hasError()).toBeTruthy()
      })
      it('if reason value is classroom disruption and further information textarea is empty', async () => {
        const restartReason = 'CLD'
        const classDisruptionInfo = ''
        const result = restartValidator.validateReason(restartReason, classDisruptionInfo)
        expect(result.hasError()).toBeTruthy()
      })
    })
    describe('returns true', () => {
      it('if any reason is provided apart from did not complete and classroom disruption', async () => {
        const restartReason = 'LOI'
        const didNotCompleteInfo = ''
        const result = restartValidator.validateReason(restartReason, didNotCompleteInfo)
        expect(result.hasError()).toBeFalsy()
      })
    })
  })
})
