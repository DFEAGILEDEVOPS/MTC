'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const bcrypt = require('bcrypt')
const numberToWords = require('number-to-words')
const User = require('../../../models/user')
const School = require('../../../models/school')
const Pupil = require('../../../models/pupil')
const config = require('../config')
const moment = require('moment')

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      (async function () {
        try {
          const schools = await createSchools()
          const users = await createUsers(schools)
          const pupils = await createPupils(schools)
        } catch (error) {
          return next(error)
        }
        mongoose.disconnect(() => next())
      }())
    })
  },

  down (db, next) {
    db.collection('schools').deleteMany({_id: {$gte: 999100, $lte: 9991005}}, (err) => {
      if (err) { next(err) }
      db.collection('users').drop((err) => {
        if (err) { next(err) }
        db.collection('pupils').deleteMany({school: {$ne: 9999999}}, (err) => {
          if (err) { next(err) }
          next()
        })
      })
    })
  }
}

function createSchools () {
  return new Promise(async function (resolve, reject) {
    const schools = []
    for (let i = 1; i < 6; i++) {
      try {
        const school = new School({
          leaCode: 999,
          estabCode: (1000 + i).toString(),
          name: 'Example School ' + toTitleCase(numberToWords.toWords(i)),
          schoolPin: await School.getUniqueSchoolPin()
        })
        await school.save()
        schools.push(school)
      } catch (error) {
        console.log(`Error saving school ${i}`, error)
        return reject(error)
      }
    }
    return resolve(schools)
  })
}

function createUsers (schools) {
  return new Promise(async function (resolve, reject) {
    try {
      const users = []
      for (let i = 0; i < schools.length; i++) {
        const school = schools[i]
        const user = new User({
          email: `teacher${i + 1}`,
          passwordHash: '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
          school: school._id,
          role: 'TEACHER'
        })
        await user.save()
        users.push(user)
      }
      const testDeveloper = new User({
        email: `test-developer`,
        passwordHash: '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
        role: 'TEST-DEVELOPER'
      })
      await testDeveloper.save()
      users.push(testDeveloper)
      resolve(users)
    } catch (error) {
      console.log('Error saving school: ', error)
      reject(error)
    }
  })
}

function createPupils (schools) {
  return new Promise(async function (resolve, reject) {
    try {
      const pupils = []
      const numPupils = [15, 30, 30, 60, 90]
      for (let i = 0; i < schools.length; i++) {
        let school = schools[i]
        let pupilsRequired = numPupils[i]
        for (let j = 0; j < pupilsRequired; j++) {
          const pupil = new Pupil({
            school: school._id,
            foreName: 'Pupil',
            middleNames: randomMiddleName(),
            lastName: toTitleCase(numberToWords.toWords(j + 1)),
            gender: Math.round(Math.random()) === 1 ? 'F' : 'M',
            dob: randomDob(),
            pin: null,
            pinExpired: false,
            hasAttended: false
          })
          await pupil.save()
          pupils.push(pupil)
        }
      }
      resolve(pupils)
    } catch (error) {
      console.log('Error saving pupil: ', error)
      reject(error)
    }
  })
}

function randomMiddleName (i) {
  const mnArray = ['Blue', 'Green', 'Red', 'Yellow', 'Purple', 'Black', 'White']
  // Assume 50% of people have middlenames
  const rnd = Math.floor(Math.random() * (mnArray.length * 2) + 1)
  return mnArray[rnd] ? mnArray[rnd] : ''
}

function toTitleCase (text) {
  return text.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

function randomDob () {
  const rnd = Math.floor(Math.random() * (365 * 2) + 1)
  const dob = moment().utc().subtract(9, 'years').subtract(rnd, 'days')
  dob.hours(0).minute(0).second(0)
  return dob.toDate()
}
