const mongoose = require('mongoose')

const School = require('../models/school')
const Pupil = require('../models/pupil')
const Answer = require('../models/answer')

const pupilService = {
  /**
   * Returns an object that consists of a plain JS school data and pupils.
   * @param {number} schoolId - School unique Id.
   */
  fetchPupilsData: async (schoolId) => {
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
   * Fetches latest set of pupils answers who have completed the check.
   * @param {string} id - Pupil Id.
   */
  fetchPupilAnswers: async (id) => {
    try {
      return await Answer.findOne({
        pupil: mongoose.Types.ObjectId(id),
        result: {$exists: true}
      }).sort({createdAt: -1}).exec()
    } catch (error) {
      throw new Error(error)
    }
  },
  /**
   * Fetches score details for pupils who have taken the check.
   * @param {object} answers - Pupil's answers set.
   * @param {object} pupilScore - Pupil's score object.
   */
  fetchScoreDetails: (answers, pupilScore) => {
    const hasScore = !!pupilScore && typeof pupilScore.correct === 'number' && pupilScore.correct >= 0
    const score = pupilScore ? `${pupilScore.correct}/${answers.answers.length}` : 'n/a'
    const percentage = pupilScore ? `${Math.round((pupilScore.correct / answers.answers.length) * 100)}%` : 'n/a'
    return {
      hasScore,
      score,
      percentage
    }
  }
}

module.exports = pupilService
