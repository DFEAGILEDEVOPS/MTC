'use stict'
var moment = require('moment-timezone')
const tzMetaData = require('moment-timezone/data/meta/latest.json')

const getOffset = zone => {
  return moment().tz(zone).format('Z')
}

const scePresenter = {}
let countryZonesCache = []

scePresenter.getCountriesTzData = () => {
  if (countryZonesCache.length > 0) return countryZonesCache

  Object.values(tzMetaData.countries).forEach(val => {
    if (val.zones.length > 1) {
      val.zones.forEach(z => {
        const zoneName = z.split('/').pop().replace('_', ' ')
        countryZonesCache.push({ name: `${val.name}, ${zoneName} (GMT ${getOffset(z)})`, zone: z })
      })
    } else {
      const z = val.zones[0]
      countryZonesCache.push({ name: `${val.name} (GMT ${getOffset(z)})`, zone: z })
    }
  })

  return countryZonesCache
}

module.exports = scePresenter
