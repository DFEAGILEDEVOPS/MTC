const Pupil = require('../../models/pupil')

const insertMany = async (pupils) => {
  const mongoosePupils = pupils.map(p => new Pupil(p))
  const savedPupils = await Pupil.insertMany(mongoosePupils)
  return savedPupils
}

module.exports = {
  insertMany
}
