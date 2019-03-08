'use stict'
var moment = require('moment-timezone')
const tzMetaData = require('moment-timezone/data/meta/latest.json')

const getOffset = zone => {
  return moment().tz(zone).format('Z')
}

const scePresenter = {}

scePresenter.getCountriesTzData = () => {
  const countryZones = []
  Object.values(tzMetaData.countries).forEach(val => {
    if (val.zones.length > 1) {
      val.zones.forEach(z => {
        const zoneName = z.split('/').pop().replace('_', ' ')
        countryZones.push({ name: `${val.name}, ${zoneName} (GMT ${getOffset(z)})`, zone: z })
      })
    } else {
      const z = val.zones[0]
      countryZones.push({ name: `${val.name} (GMT ${getOffset(z)})`, zone: z })
    }
  })
  return countryZones
}

module.exports = scePresenter
