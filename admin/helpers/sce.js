'use stict'
const tzMetaData = require('moment-timezone/data/meta/latest.json')

const scePresenter = {}

scePresenter.getCountriesTzData = () => {
  const countryZones = []
  Object.values(tzMetaData.countries).forEach(val => {
    if (val.zones.length > 1) {
      val.zones.forEach(z => {
        const zoneName = z.split('/').pop().replace('_', ' ')
        countryZones.push({ name: `${val.name}, ${zoneName}`, zone: z })
      })
    } else {
      countryZones.push({ name: val.name, zone: val.zones[0] })
    }
  })
  return countryZones
}

module.exports = scePresenter
