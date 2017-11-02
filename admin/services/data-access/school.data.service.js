'use strict'

const School = require('../../models/school')

const schoolDataService = {}

schoolDataService.findOne = async function (options) {
  const s = await School.findOne(options).lean().exec()
  return s
}

schoolDataService.update = async function (id, doc) {
  return new Promise((resolve, reject) => {
    School.updateOne({_id: id}, doc, (error) => {
      if (error) { return reject(error) }
      resolve(null)
    })
  })
}

module.exports = schoolDataService
