'use strict'

const Pupil = require('../../models/pupil')
const pupilDataService = {}

/**
 * Insert a list of pupils in the db
 * @param pupils
 * @return {Array}
 */
pupilDataService.insertMany = async (pupils) => {
  const mongoosePupils = pupils.map(p => new Pupil(p))
  const savedPupils = await Pupil.insertMany(mongoosePupils)
  return savedPupils
}

/**
 * Find a single pupil by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilDataService.findOne = async function (options) {
  return Pupil.findOne(options).populate('school').lean().exec()
}

/**
 * Find pupils by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilDataService.find = async function (options) {
  return Pupil.find(options).lean().exec()
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
