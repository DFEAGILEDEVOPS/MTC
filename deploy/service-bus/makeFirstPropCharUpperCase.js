'use strict'

const fourteenDays = 'P14D'
const fiveMinutes = 'PT5M'
const oneDay = 'P1D'
const sixDays = 'P6D'
const fiveGigabytes = 5120

const data = {
  MaxSizeInMegabytes: fiveGigabytes,
  DefaultMessageTimeToLive: fourteenDays,
  LockDuration: fiveMinutes,
  RequiresDuplicateDetection: true,
  DeadLetteringOnMessageExpiration: true,
  DuplicateDetectionHistoryTimeWindow: oneDay,
  EnablePartitioning: false,
  RequiresSession: false
}

function makeObjectPropertiesFirstCharUpperCase (obj) {
  var key, keys = Object.keys(obj)
  var n = keys.length
  var newobj={}
  while (n--) {
    key = `${keys[n].substr(0,1).toUpperCase()}${keys[n].substr(1)}`
    newobj[key] = obj[key]
  }
  return newobj
}

const output = makeObjectPropertiesFirstCharUpperCase(data)
console.dir(output)
