'use strict';

const express = require('express');
const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose');
const csv = require('fast-csv');
const fs = require('fs-extra');

const Pupil = require('../models/pupil');
const User = require('../models/user');
const School = require('../models/school');
const answer = require('../models/answer');
const randomGenerator = require('../lib/random-generator');
const ValidationError = require('../lib/validation-error');
const errorConverter = require('../lib/error-converter');
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil;
const hdfErrorMessages = require('../lib/errors/hdf');
const pupilValidator = require('../lib/validator/pupil-validator');
const hdfValidator = require('../lib/validator/hdf-validator');
const isAuthenticated = require('../authentication/middleware');

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
    return await answer.findOne({
      pupil: mongoose.Types.ObjectId(id),
      result: {$exists: true}
    }).sort({createdAt: -1}).exec();
  } catch (error) {
    return next(error);
  }
};

router.get('/pupil/add', isAuthenticated(), async function(req, res, next) {
  res.locals.pageTitle = 'Add pupil';
  const schoolId = req.user.School; // school object from session
  let school;

  try {
    school = await School.findOne({_id: schoolId}).exec();
    if (!school) {
      throw new Error(`School [${schoolId}] not found`);
    }
  } catch (error) {
    return next(error);
  }

  try {
    req.breadcrumbs(res.locals.pageTitle);

    res.render('school/add-pupil', {
      school: school.toJSON(),
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pupil/add', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Add pupil';

  /**
   * Mongoose School Model
   */
  let school;

  try {
    school = await School.findOne({_id: req.body.school}).exec();
    if (!school) {
      throw new Error(`School [${schoolId}] not found`);
    }
  } catch (error) {
    return next(error);
  }

  let validationError = await pupilValidator.validate(req);

  const pupil = new Pupil({
    school: school._id,
    upn: req.body.upn,
    foreName: req.body.foreName,
    lastName: req.body.lastName,
    middleNames: req.body.middleNames,
    gender: req.body.gender,
    dob: moment.utc('' + req.body['dob-day'] + '/' + req.body['dob-month'] + '/' + req.body['dob-year'], 'DD/MM/YYYY'),
    pin: null,
    pinExpired: false
  });

  try {
    await pupil.validate();
    if (validationError.hasError()) { throw new Error('custom validation error') }
  } catch (error) {

    req.breadcrumbs(res.locals.pageTitle);

    if (error.message !== 'custom validation error') {
      // Mongoose error
      // At this point we have validated the schema and may or may not have anything in validationError
      // So = combine all validation errors into one
      let combinedValidationError = errorConverter.fromMongoose(error, addPupilErrorMessages, validationError);
      // error fixup: if the mongoose schema bails out on the dob field - we should make sure we have some
      // actual html fields that have an error.  If we do, we can ditch the mongoose error as being superfluous.
      if (combinedValidationError.isError('dob') && (combinedValidationError.isError('dob-day') || combinedValidationError.isError('dob-month') || combinedValidationError.isError('dob-year'))) {
        combinedValidationError.removeError('dob');
      }
      return res.render('school/add-pupil', {
        school: school.toJSON(),
        formData: req.body,
        error: combinedValidationError,
        breadcrumbs: req.breadcrumbs()
      });
    }

    return res.render('school/add-pupil', {
      school: school.toJSON(),
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    });
  }

  try {
    await pupil.save();
  } catch (error) {
    next(error);
  }

  // pupil saved
  // TODO: add flash message
  res.redirect('/school/manage-pupils');
});

router.get('/pupil/edit/:id', async function (req, res, next) {
  res.locals.pageTitle = 'Edit pupil data';

  try {
    const pupil = await Pupil.findOne({ _id: req.params.id}).exec();
    if (!pupil) {
      return next(new Error(`Pupil ${req.body.id} not found`));
    }
    const school = await School.findOne({_id: pupil.school}).exec();
    if (!school) {
      return next(new Error(`School ${pupil.school} not found`));
    }
    const pupilData = pupil.toJSON();
    const dob = moment(pupil.dob);
    // expand single date field to 3
    delete pupilData['dob'];
    pupilData['dob-day'] = dob.format('D');
    pupilData['dob-month'] = dob.format('M');
    pupilData['dob-year'] = dob.format('YYYY');

    req.breadcrumbs(res.locals.pageTitle);
    res.render('school/edit-pupil', {
      school: school.toJSON(),
      formData: pupilData,
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pupil/edit', async function (req, res, next) {
  let pupil;
  let school;
  let validationError;
  // In case we render an error page
  res.locals.pageTitle = 'Edit pupil data';

  try {
    pupil = await Pupil.findOne({_id: req.body._id}).exec();
    if (!pupil) {
      return next(new Error(`Pupil ${req.body.id} not found`));
    }
    school = await School.findOne({_id: pupil.school}).exec();
    if (!school) {
      return next(new Error(`School ${pupil.school} not found`));
    }
    validationError = await pupilValidator.validate(req);
  } catch (error) {
    return next(error);
  }

  pupil.foreName = req.body.foreName;
  pupil.middleNames = req.body.middleNames;
  pupil.lastName = req.body.lastName;
  pupil.upn = req.body.upn;
  pupil.gender = req.body.gender;
  pupil.pin = pupil.pin || null;
  pupil.pinExpired = pupil.pinExpired || false;
  pupil.dob = moment.utc('' + req.body['dob-day'] + '/' + req.body['dob-month'] + '/' + req.body['dob-year'], 'DD/MM/YYYY');

  try {
    await pupil.validate();
    if (validationError.hasError()) {
      throw new Error('custom validation error')
    }
  } catch (error) {

    req.breadcrumbs(res.locals.pageTitle);

    if (error.message !== 'custom validation error') {
      // Mongoose error
      // At this point we have validated the schema and may or may not have anything in validationError
      // So = combine all validation errors into one
      let combinedValidationError = errorConverter.fromMongoose(error, addPupilErrorMessages, validationError);
      // error fixup: if the mongoose schema bails out on the dob field - we should make sure we have some
      // actual html fields that have an error.  If we do, we can ditch the mongoose error as being superfluous.
      if (combinedValidationError.isError('dob') && (combinedValidationError.isError('dob-day') || combinedValidationError.isError('dob-month') || combinedValidationError.isError('dob-year'))) {
        combinedValidationError.removeError('dob');
      }
      return res.render('school/edit-pupil', {
        school: school.toJSON(),
        formData: req.body,
        error: combinedValidationError,
        breadcrumbs: req.breadcrumbs()
      });
    }

    return res.render('school/edit-pupil', {
      school: school.toJSON(),
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    });
  }

  try {
    await pupil.save()
  } catch (error) {
    next(error);
  }

  // pupil saved
  // TODO: add flash message
  res.redirect('/school/manage-pupils');

});

router.get('/school-home', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'School Homepage';
  let schoolName = '';

  try {
    const school = await School.findOne({'_id': req.user.School}).exec();
    if (!school) {
      return next(new Error(`School not found: ${req.user.School}`));
    }
    schoolName = school.name;
  } catch (error) {
    return next(error);
  }
  
  return res.render('school/school-home', {
    schoolName,
    breadcrumbs: [{ 'name': 'School Home' }]
  })
});

/* GET manage pupils page. */
router.get('/manage-pupils', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Manage pupils';
  const { pupils, schoolData } = await fetchPupilsData(req, next);
  let pupilsData = pupils.map( e => e.toJSON() );

  // Format DOB
  pupilsData = await Promise.all(pupilsData.map(async(item) => {
    const dob = new Date(item.dob);
    item['dob'] = dob.getDate() + '/' + (dob.getMonth() + 1) + '/' + dob.getFullYear();
    const answers = await fetchPupilAnswers(item._id, next);
    const pupilScore = answers && answers.result;
    item.hasScore = !!pupilScore && typeof pupilScore.correct === 'number' && pupilScore.correct >= 0;
    item.percentage = pupilScore ? `${Math.round((pupilScore.correct / answers.answers.length) * 100)}%` : 'n/a';
    return item;
  }));
  req.breadcrumbs(res.locals.pageTitle);
  return res.render('school/manage-pupils', {
    pupils: pupilsData,
    schoolPin: schoolData.schoolPin,
    todayDate: new Date(),
    breadcrumbs: req.breadcrumbs()
  });
});

router.get('/results', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Results';
  const { pupils, schoolData } = await fetchPupilsData(req, next);
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`;
    const answers = await fetchPupilAnswers(p._id, next);
    const pupilScore = answers && answers.result;
    const hasScore = !!pupilScore && typeof pupilScore.correct === 'number' && pupilScore.correct >= 0;
    const score = pupilScore ? `${pupilScore.correct}/${answers.answers.length}` : 'n/a';
    const percentage = pupilScore ? `${Math.round((pupilScore.correct / answers.answers.length) * 100)}%` : 'n/a';
    return {
      fullName,
      hasScore,
      score,
      percentage
    }
  })).catch((error) => next(error));
  req.breadcrumbs(res.locals.pageTitle);
  pupilsFormatted = pupilsFormatted.filter((p) => p.hasScore);
  if ((schoolData.hdf && schoolData.hdf.signedDate) &&
    (typeof pupilsFormatted === 'object' && Object.keys(pupilsFormatted).length > 0)) {
    return res.render('school/results', {
      breadcrumbs: req.breadcrumbs(),
      pupils: pupilsFormatted,
      schoolData
    });
  } else {
    return res.render('school/no-results', {
      breadcrumbs: req.breadcrumbs(),
    });
  }
});

router.get('/download-results', isAuthenticated(), async function (req, res, next) {
  //TODO: refactor to make it smaller
  const csvStream = csv.createWriteStream();
  const { schoolData, pupils } = await fetchPupilsData(req, next);
  // Format the pupils
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`;
    const dob = moment(p.dob).format("DD/MM/YYYY");
    const answersSet = await fetchPupilAnswers(p._id, next);
    if (!answersSet) return;
    let answers = answersSet.answers && answersSet.answers.sort((a1, a2) => {
      const f1 = a1.factor1 - a2.factor1;
      if (f1 !== 0) return f1;
      return a1.factor2 - a2.factor2;
    });
    answers = answers.map(a => {
      const question = `${a.factor1}x${a.factor2}`;
      const pupilAnswer = a.input;
      const answerMark = a.isCorrect ? 1 : 0;
      return {
        question,
        pupilAnswer,
        answerMark
      }
    });
    const pupilScore = answersSet && answersSet.result;
    if (!pupilScore || typeof pupilScore.correct !== 'number') return;
    const totalMark = pupilScore && pupilScore.correct.toString();
    return {
      fullName,
      dob,
      answers,
      totalMark
    }
  })).catch((error) => next(error));
  pupilsFormatted = pupilsFormatted.filter((p) => p);
  const pupilStructure = pupilsFormatted[0];
  const csvContent = [];
  const csvHeaders = ['Full Name', 'Date of Birth'];
  // Generate the row headers
  pupilStructure.answers.forEach((answer, i) => {
    const question = `Question ${i+1}`;
    const input = `Answer ${i+1}`;
    const mark = `Mark ${i+1}`;
    csvHeaders.push(question, input, mark);
  });
  csvHeaders.push('Score');
  // Generate the pupils
  const csvPupils = [];
  pupilsFormatted.forEach((p, i) => {
    csvPupils[i] = [];
    Object.keys(p).forEach((k) => {
      if (k === 'answers') {
        p[k].forEach((a) => {
          Object.keys(a).forEach((ak) => csvPupils[i].push(a[ak].toString()));
        });
      } else {
        csvPupils[i].push(p[k]);
      }
    });
  });
  csvContent.push(csvHeaders);
  csvPupils.forEach((p) => csvContent.push(p));
  const checkDate = moment(moment.now()).format("DD MMM YYYY");
  res.setHeader('Content-disposition', `attachment; filename=Results ${schoolData.leaCode}${schoolData.estabCode} ${checkDate}.csv`);
  res.setHeader('content-type', 'text/csv');
  csvContent.forEach((row) => csvStream.write(row));
  csvStream.pipe(res);
  csvStream.end();
});

/* POST generate pins */
router.post('/generate-pins', isAuthenticated(), async function (req, res, next) {
  if (!req.body['pupil']) {
    console.error('generatePins: no pupils selected');
    // TODO: inform the user via flash message?
    return res.redirect('/school/manage-pupils');
  }
  const data = Object.values(req.body['pupil'] || null);
  const chars = '23456789bcdfghjkmnpqrstvwxyz';
  const length = 5;
  let pupils;

  // fetch pupils
  try {
    pupils = await Pupil.find({_id: data}).exec();
  } catch (error) {
    console.error('Failed to find pupils: ' + error.message);
    return next(error);
  }

  // Apply the updates to the pupil object(s)
  pupils.forEach(pupil => {
    if (!pupil.pin) {
      pupil.pin = randomGenerator.getRandom(length, chars);
      pupil.expired = false;
    }
  });

  // Save our pupils, in parallel
  const promises = pupils.map(p => p.save()); // returns Promise

  Promise.all(promises).then(results => {
      // all pupils saved ok
      return res.redirect('/school/manage-pupils');
    },
    error => {
      // one or more promises were rejected
      // TODO: add a flash message informing the user
      console.error(error);
      return res.redirect('/school/manage-pupils');
    })
    .catch(error => {
      console.error(error);
      // TODO: add a flash message informing the user
      return res.redirect('/school/manage-pupils');
    });
});

router.get('/print-pupils', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Print pupils';
  let pupilsFormatted;
  try {
    const { pupils, schoolData } = await fetchPupilsData(req, next);
    const pupilsData = pupils.map(e => e.toJSON()).filter(p => !!p.pin && !p.pinExpired);
    pupilsFormatted = pupilsData.map(p => {
      return {
        fullName: `${p.foreName} ${p.lastName}`,
        schoolPin: schoolData.schoolPin,
        pupilPin: p.pin
      }
    });
  } catch (error) {
    return next(error);
  }
  res.render('school/pupils-print', {
    pupils: pupilsFormatted
  });
});

router.get('/submit-attendance', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Attendance register';
  req.breadcrumbs(res.locals.pageTitle);
  const { pupils, schoolData } = await fetchPupilsData(req, next);
  // Redirect to confirmation of submission if hdf has been signed
  if (schoolData.hdf && schoolData.hdf.signedDate) {
    return res.redirect('/school/declaration-form-submitted');
  }
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`;
    const { _id: id ,hasAttended } = p;
    const answers = await fetchPupilAnswers(p._id, next);
    const pupilScore = answers && answers.result;
    const hasScore = !!pupilScore && typeof pupilScore.correct === 'number' && pupilScore.correct >= 0;
    const scorePercentage = pupilScore ? `${Math.round((pupilScore.correct / answers.answers.length) * 100)}%` : 'n/a';
    return {
      id,
      fullName,
      hasAttended,
      hasScore,
      scorePercentage
    }
  })).catch((error) => next(error));
  pupilsFormatted = pupilsFormatted.filter((p) => p.scorePercentage !== 'n/a');
  // Redirect to declaration form if at least one has been submitted for attendance
  if (pupilsFormatted.length > 0 && pupilsFormatted.some((p) => p.hasAttended)) {
    return res.redirect('/school/declaration-form');
  }
  return res.render('school/submit-attendance-register', {
    breadcrumbs: req.breadcrumbs(),
    pupils: pupilsFormatted
  });
});

router.post('/submit-attendance-form', isAuthenticated(), async function (req, res, next) {
  const attendees = req.body['attendee'];
  if (!attendees) {
    //Needs proper frontend handling
    return res.redirect('/school/submit-attendance')
  }
  const data = Object.values(req.body['attendee'] || null);
  let selected;
  const { pupils } = await fetchPupilsData(req, next);
  try {
    selected = await Pupil.find({_id: data}).exec();
  } catch (error) {
    return next(error);
  }
  // Update attendance for selected pupils
  selected.forEach((p) => p.hasAttended = true);
  const selectedPromises = selected.map(s => s.save());
  // Expire all pins for school pupils
  pupils.forEach(p => p.pinExpired = true);
  const pupilsPromises = pupils.map(p => p.save());
  Promise.all([selectedPromises, pupilsPromises]).then(() => {
      return res.redirect('/school/declaration-form');
    },
      error => next(error))
    .catch(error => next(error)
    );
});

router.get('/declaration-form', isAuthenticated(), async function (req, res, next) {
  const { schoolData } = await fetchPupilsData(req, next);
  if (schoolData.hdf && schoolData.hdf.signedDate) {
    return res.redirect('/school/declaration-form-submitted');
  }
  req.body['fullName'] = req.user && req.user['UserName'];
  res.locals.pageTitle = 'Headteacher\'s declaration form';
  req.breadcrumbs('Attendance register');
  req.breadcrumbs(res.locals.pageTitle);
  return res.render('school/declaration-form',{
    formData: req.body,
    error: new ValidationError(),
    breadcrumbs: req.breadcrumbs()
  });
});

router.post('/submit-declaration-form', isAuthenticated(), async function (req, res, next) {
  const { jobTitle, fullName, declaration } = req.body;
  const school = await School.findOne({ '_id': req.user.School }).exec();
  school.hdf = {
    signedDate: Date.now(),
    declaration,
    jobTitle,
    fullName,
  };
  let validationError = await hdfValidator.validate(req);
  try {
    await school.validate();
    if (validationError.hasError()) { throw new Error('school validation error') }
  } catch (error) {
    res.locals.pageTitle = 'Headteacher\'s declaration form';
    req.breadcrumbs(res.locals.pageTitle);
    if (error.message !== 'school validation error') {
      const combinedValidationError = errorConverter.fromMongoose(error, hdfErrorMessages, validationError);
      return res.render('school/declaration-form', {
        formData: req.body,
        error: combinedValidationError,
        breadcrumbs: req.breadcrumbs()
      });
    }
    return res.render('school/declaration-form', {
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    });
  }
  try {
    await school.save();
  }
  catch (error) {
    return next(error);
  }
  return res.redirect('/school/declaration-form-submitted');
});

router.get('/declaration-form-submitted', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Headteacher\'s declaration form submitted';
  req.breadcrumbs(res.locals.pageTitle);
  let school;
  try {
    school = await School.findOne({'_id': req.user.School}).exec();
  }
  catch(error) {
    return next(error)
  }
  const { hdf: { signedDate } } = school;
    return res.render('school/declaration-form-submitted',{
    breadcrumbs: req.breadcrumbs(),
    signedDate: signedDate && moment(signedDate).format('Do MMMM YYYY')
  });
});

module.exports = router;
