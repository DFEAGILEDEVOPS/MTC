const Pupil = require('../../models/pupil')

const createPupilEntity = (pupil) => new Pupil(pupil)

const insertMany = async (pupils) => {
  const savedPupils = await Pupil.insertMany(pupils)
  return savedPupils
}

module.exports = {
  createPupilEntity,
  insertMany
}
