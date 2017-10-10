const Pupil = require('../../models/pupil')

module.exports.insertMany = async (pupils) => {
  const savedPupils = await Pupil.insertMany(pupils, (err) => {
    if (err) {
      throw new Error(err)
    }
  })
  return savedPupils
}
