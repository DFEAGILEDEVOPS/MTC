'use strict'

const Pupil = require('../../models/pupil')
const School = require('../../models/school')
const pupilDataService = {}

/**
 * Returns an object that consists of a plain JS school data and pupils.
 * @param {number} schoolId - School unique Id.
 * @return {Object}
 */

pupilDataService.getPupils = async (schoolId) => {
  const [ schoolData, pupils ] = await Promise.all([
    School.findOne({'_id': schoolId}).lean().exec(),
    Pupil.getPupils(schoolId).exec()
  ]).catch((error) => {
    throw new Error(error)
  })
  return {
    schoolData,
    pupils
  }
}

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

/**
 * Returns pupils filtered by school and sorted by field and direction (asc/desc)
 * @param schoolId
 * @param sortingField
 * @param sortingDirection
 * @returns {Array}
 */
pupilDataService.getSortedPupils = async (schoolId, sortingField, sortingDirection) => {
  // TODO: Introduce integration tests
  const sort = {}
  sort[sortingField] = sortingDirection
  return Pupil
    .find({'school': schoolId})
    .sort(sort)
    .lean()
    .exec()
}

module.exports = pupilDataService
