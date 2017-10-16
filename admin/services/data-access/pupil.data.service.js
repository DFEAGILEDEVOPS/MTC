'use strict'

const Pupil = require('../../models/pupil')
const pupilDataService = {}

/**
 * Find a single pupil by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilDataService.findOne = async function (options) {
  const p = await Pupil.findOne(options).populate('school').lean().exec()
  return p
}

/**
 * Update a single object with the new fields from `doc`
 * @param {string} id Object._id
 * @param {Object} doc Document to pass to mongo
 * @return {Promise}
 */
pupilDataService.update = async function (id, doc) {
  return new Promise((resolve, reject) => {
    Pupil.updateOne({_id: id}, doc, (error) => {
      if (error) { return reject(error) }
      resolve(null)
    })
  })
}

module.exports = pupilDataService
