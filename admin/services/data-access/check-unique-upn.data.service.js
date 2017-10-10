const Pupil = require('../../models/pupil')

module.exports.isUnique = async (upn, id) => {
  const pupil = await Pupil.findOne({ upn: upn }).exec()
  return pupil && pupil._id.toString() !== id
}
