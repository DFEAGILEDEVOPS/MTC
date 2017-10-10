const Pupil = require('../../models/pupil')

module.exports.createPupilEntity = (pupil) => new Pupil(pupil)
