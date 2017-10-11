const Pupil = require('../../models/pupil')

module.exports.insertMany = async (pupils) => {
  const savedPupils = await Pupil.insertMany(pupils)
  return savedPupils
}
