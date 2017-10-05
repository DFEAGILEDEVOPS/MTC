const mongoose = require('mongoose')

const School = require('../models/school')
const Pupil = require('../models/pupil')
const Answer = require('../models/answer')

/** @namespace */

const pupilService = {
  /**
   * Returns an object that consists of a plain JS school data and pupils.
   * @param {number} schoolId - School unique Id.
   */
  fetchPupilsData: async (schoolId) => {
    // TODO: Introduce integration tests
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
  },
  /**
   * Returns pupils filtered by school and sorted by field and direction (asc/desc)
   * @param schoolId
   * @param sortingField
   * @param sortingDirection
   * @returns {Promise.<*>}
   */
  fetchSortedPupilsData: async (schoolId, sortingField, sortingDirection) => {
    // TODO: Introduce integration tests
    const sort = {}
    sort[sortingField] = sortingDirection
    const pupils = await Pupil
      .find({'school': schoolId})
      .sort(sort)
      .lean()
      .exec()
    return pupils
  },
  fetchMultiplePupils: (pupilIds) => {
    return Pupil
      .find({'_id': { $in: pupilIds }})
      .exec()
  },
  /**
   * Fetches latest set of pupils answers who have completed the check.
   * @param {string} id - Pupil Id.
   */
  fetchPupilAnswers: async (id) => {
    // TODO: Introduce integration tests
    const answers = await Answer.findOne({
      pupil: mongoose.Types.ObjectId(id),
      result: {$exists: true}
    }).sort({createdAt: -1}).exec()
    return answers
  },
  /**
   * Fetches score details for pupils who have taken the check.
   * @param {object} answers - Pupil's answers set.
   */
  fetchScoreDetails: (answers) => {
    const pupilScore = answers && answers.result
    const hasScore = !!pupilScore && typeof pupilScore.correct === 'number' && pupilScore.correct >= 0
    const score = pupilScore ? `${pupilScore.correct}/${answers.answers.length}` : 'N/A'
    const percentage = pupilScore ? `${Math.round((pupilScore.correct / answers.answers.length) * 100)}%` : 'N/A'
    return {
      hasScore,
      score,
      percentage
    }
  }
}

module.exports = pupilService
