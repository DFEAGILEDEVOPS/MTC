const mongoose = require('mongoose');

const School = require('../models/school');
const Pupil = require('../models/pupil');
const Answer = require('../models/answer');

const fetchPupilsData = async (req, next) => {
  try {
    const schoolData = await School.findOne({ '_id': req.user.School }).lean().exec();
    const pupils = await Pupil.getPupils(schoolData._id).exec();
    return {
      schoolData,
      pupils
    }
  } catch (error) {
    return next(error);
  }
};

const fetchPupilAnswers = async (id, next) =>  {
  try {
    return await Answer.findOne({
      pupil: mongoose.Types.ObjectId(id),
      result: {$exists: true}
    }).sort({createdAt: -1}).exec();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  fetchPupilsData,
  fetchPupilAnswers
};