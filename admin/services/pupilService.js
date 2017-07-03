const mongoose = require('mongoose')

const School = require('../models/school')
const Pupil = require('../models/pupil')
const Answer = require('../models/answer')

const pupilService = {
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
  fetchPupilAnswers: async (id, next) => {
    try {
      return await Answer.findOne({
        pupil: mongoose.Types.ObjectId(id),
        result: {$exists: true}
      }).sort({createdAt: -1}).exec()
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = pupilService
