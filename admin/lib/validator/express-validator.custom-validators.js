'use strict'

const upnService = require('../../services/upn.service')

module.exports = {
  customValidators: {
    upnHasCorrectCheckLetter: (val, options = {}) => {
      const expected = upnService.calculateCheckLetter(val.substring(1))
      if (expected !== val[0]) {
        // console.log(`UPN check letter validation failed for [${val}]: expected [${expected}] but got [${val[0]}]`)
        return false
      }
      return true
    },
    upnHasValidLaCode: (val, options = {}) => {
      // The LA Code is characters 2-4
      if (!val && val.length > 4) {
        // console.log(`upnHasValidLaCode: val: [${val}] failed check guard`)
        return false
      }
      return upnService.hasValidLaCode(val)
    },
    upnHasValidChars5To12: (val, options = {}) => {
      if (!(/^[A-Z]\d{11}[0-9A-Z]$/.test(val))) {
        // console.log(`UPN upnHasValidChars5To12 for [${val}] failed regex check`)
        return false
      }
      return true
    },
    upnHasValidChar13: (val, options = {}) => {
      if (val.length !== 13) {
        // console.log(`upnHasValidChar13: val: [${val}] failed length check`)
        return false
      }
      const char = val[12] // 13th char
      if (!/^[ABCDEFGHJKLMNPQRTUVWXYZ0-9]$/.test(char)) {
        // console.log(`upnHasValidChar13: val: [${val}] failed char 13 check`)
        return false
      }
      return true
    }
  } // end custom validators
}
