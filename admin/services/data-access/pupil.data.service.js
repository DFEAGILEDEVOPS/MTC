'use strict'

const Pupil = require('../../models/pupil')
const School = require('../../models/school')
const PupilStatusCode = require('../../models/pupil-status-code')
const pupilDataService = {}

/**
 * Returns an object that consists of a plain JS school data and pupils.
 * @param {number} schoolId - School unique Id.
 * @return {Object}
 */

pupilDataService.getPupils = async (schoolId) => {
  const [ schoolData, pupils ] = await Promise.all([
    School.findOne({'_id': schoolId}).lean().exec(),
    Pupil.find({ school: schoolId }).sort({ createdAt: 1 }).lean().exec()
  ]).catch((error) => {
    throw new Error(error)
  })
  return {
    schoolData,
    pupils
  }
}

/**
 * Returns pupils filtered by school and sorted by field and direction (asc/desc)
 * @param schoolId
 * @param sortingField
 * @param sortingDirection
 * @returns {Array}
 */
pupilDataService.getSortedPupils = async (schoolId, sortingField, sortingDirection) => {
  const sort = {}
  sort[sortingField || 'lastName'] = sortingDirection || 'asc'
  return Pupil
    .find({'school': schoolId})
    .sort(sort)
    .lean()
    .exec()
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
  return Pupil.findOne(options).populate('school').lean().exec()
}

/**
 * Find and return non-lean pupils by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilDataService.find = async function (options) {
  return Pupil.find(options).lean().exec()
}

/**
 * Generalised update function - can update many in one transaction
 * @param query
 * @param criteria
 * @return {Promise}
 */
pupilDataService.update = async function (query, criteria, options = {multi: false}) {
  return Pupil.update(query, criteria, options).exec()
}

pupilDataService.updateMultiple = async function (pupils) {
  // returns Promise
  let savedPupils = []
  await Promise.all(pupils.map(p => Pupil.updateOne({ '_id': p._id }, p)))
    .then(results => {
      // all pupils saved ok
      savedPupils = results
    },
    error => { throw new Error(error) }
  )
  return savedPupils
}

/**
 * Create a new Pupil
 * @param data
 * @return {Promise}
 */
pupilDataService.save = async function (data) {
  const pupil = new Pupil(data)
  await pupil.save()
  return pupil.toObject()
}

/**
 * Unset the attendance code for a single pupil
 * @param id
 * @return {Promise<*>}
 */
pupilDataService.unsetAttendanceCode = async function (id) {
  return Pupil.update({ _id: id }, { $unset: { attendanceCode: true } })
}

/**
 * Get all the restart codes documents
 * @return {Promise.<{Object}>}
 */
pupilDataService.getStatusCodes = async () => {
  return PupilStatusCode.find().lean().exec()
}

module.exports = pupilDataService
