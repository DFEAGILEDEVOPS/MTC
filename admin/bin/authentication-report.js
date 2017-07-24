#!/usr/bin/env node
'use strict'

const mongoose = require('mongoose')
const Levenshtein = require('levenshtein')
const LogonEvent = require('../models/logon-event')
mongoose.promise = global.Promise

mongoose.connect(process.env.MONGO_CONNECTION_STRING, async function (error) {
  if (error) { return console.error(error) }
  await main()
  mongoose.disconnect()
})

async function main () {
  const sessions = await getDistinctSessionsOrderedByLongest()
  const individualSessions = individualise(sessions)
  report(individualSessions)
}

/**
 * Return an object with sessionIds as the keys with array of session documents as the values
 * @return {Promise.<{}>}
 */
async function getDistinctSessionsOrderedByLongest () {
  const dbSessions = await LogonEvent
    .aggregate([
      {
        $group: {_id: '$sessionId', count: {$sum: 1}}
      },
      {
        $sort: {count: -1}
      }
    ]).exec()
  // This returns an array of objects: `[{ _id: '1IYOx265QDD82As1WFfIPBgsBzJomrQS', count: 3 },...]`
  // ordered by number of underlying documents (login attempts)
  // However, some of these are for more than 1 pupil, e.g. if they resuse the session which can happen if the
  // session times out perhaps.
  const sessions = {}
  let count = 0
  let docsCount = 0
  for (const doc of dbSessions) {
    sessions[doc._id] = await LogonEvent.find({sessionId: doc._id}).sort({createdAt: 1}).lean().exec()
    docsCount += sessions[doc._id].length
    count += 1
    if (count % 100 === 0) console.log('Fetch session info for 100 sessions')
  }
  console.log(`fetched ${count} sessions with ${docsCount} documents`)
  return sessions
}

/**
 * Break up the sessions in the database into those of individual users as a single session
 * may be used by more than one user, e.g. if there is a timeout rather than clicking the
 * `logout` button. Uses the levenschtein distance.
 *
 * @param sessions Array of session objects
 * @return {Array}
 */
function individualise (sessions) {
  const individualSessions = []
  Object.entries(sessions).forEach(([key, value]) => {
    // add new sessions to the end of individualSessions
    Array.prototype.push.apply(individualSessions, breakApart(value))
  })
  return individualSessions
}

function breakApart (sessions) {
  const newSessions = []
  let buffer = []
  let lastPupilPin = null

  for (let i = 0; i < sessions.length; i++) {
    if (buffer.length === 0) {
      // new session
      sessions[i].new = 'buffer empty, new session'
      buffer.push(sessions[i])
      // allow for authentication first time
      if (sessions[i].isAuthenticated) {
        newSessions.push(buffer)
        buffer = []
      }
    } else if (sessions[i].isAuthenticated) {
      // as they have authenticated the auth trail stops here
      sessions[i].new = 'isAuthenticated'
      buffer.push(sessions[i])
      newSessions.push(buffer)
      buffer = []
    } else if ((new Levenshtein(lastPupilPin, sessions[i].pupilPin)).distance >= 3) {
      // this looks like a different pupil pin, so this is classed as a different pupil
      sessions[i].new = 'Looks like a new pupil'
      newSessions.push(buffer)
      buffer = []
      buffer.push(sessions[i])
    } else {
      // another attempt by the same pupil
      sessions[i].new = 'another attempt'
      buffer.push(sessions[i])
    }
    lastPupilPin = sessions[i].pupilPin
  }
  if (buffer.length) {
    newSessions.push(buffer)
  }
  // return array of arrays, with each array being a whole journey
  return newSessions
}

/**
 * sessions [[LogonEvents]]
 */
function report (sessions) {
  const report = {}
  report.howMany = howMany(sessions)
  report.howManySuccessful = howManySuccessful(sessions)
  report.howManyHadACapitalInFirstPosition = howManyHaveACapitalLetterInFirstPosition(sessions)
  report.howManyHasACapitalLetter = howManyHaveACapitalLetter(sessions)
  report.howManyHaveASpace = howManyHaveASpace(sessions)
  report.averageJourneyLength = averageJourneyLength(sessions)
  report.maxJourneyLength = maxJourneyLength(sessions)
  report.journeyDistribution = getJourneyDistribution(sessions)
  console.log(report)
}

function getJourneyDistribution (sessions) {
  const authRequests = {}
  for (let i = 0; i < sessions.length; i++) {
    if (authRequests[sessions[i].length]) {
      authRequests[sessions[i].length] += 1
    } else {
      authRequests[sessions[i].length] = 1
    }
  }
  return authRequests
}

function howMany (sessions) {
  let count = 0
  for (let i = 0; i < sessions.length; i++) {
    count += sessions[i].length
  }
  return count
}

function howManySuccessful (sessions) {
  let count = 0
  for (let i = 0; i < sessions.length; i++) {
    for (let j = 0; j < sessions[i].length; j++) {
      if (sessions[i][j].isAuthenticated === true) {
        count += 1
      }
    }
  }
  return count
}
function howManyHaveACapitalLetterInFirstPosition (sessions) {
  let count = 0

  for (let i = 0; i < sessions.length; i++) {
    for (let j = 0; j < sessions[i].length; j++) {
      if (startsWithACapital(sessions[i][j].schoolPin)) {
        count += 1
      }
      if (startsWithACapital(sessions[i][j].pupilPin)) {
        count += 1
      }
    }
  }
  return count
}

function howManyHaveACapitalLetter (sessions) {
  let count = 0

  for (let i = 0; i < sessions.length; i++) {
    for (let j = 0; j < sessions[i].length; j++) {
      if (sessions[i][j].schoolPin.length > 0) {
        if (hasAnUppercaseLetter(sessions[i][j].schoolPin)) {
          count += 1
        }
      }
      if (sessions[i][j].pupilPin.length > 0) {
        if (hasAnUppercaseLetter(sessions[i][j].pupilPin)) {
          count += 1
        }
      }
    }
  }
  return count
}

function howManyHaveASpace (sessions) {
  let count = 0

  for (let i = 0; i < sessions.length; i++) {
    for (let j = 0; j < sessions[i].length; j++) {
      if (hasASpace(sessions[i][j].schoolPin)) {
        count += 1
      }
      if (hasASpace(sessions[i][j].pupilPin)) {
        count += 1
      }
    }
  }
  return count
}

function hasAnUppercaseLetter (string) {
  return (/[A-Z]/.test(string))
}

function startsWithACapital (string) {
  if (string.length === 0) {
    return false
  }
  return (/^[A-Z]/.test(string))
}

function hasASpace (string) {
  return (/ /.test(string))
}

function averageJourneyLength (sessions) {
  let total = 0
  let count = 0

  for (let i = 0; i < sessions.length; i++) {
    total += parseInt(sessions[i].length, 10)
    count += 1
  }
  console.log(`count is ${count} total is ${total}`)
  return (total / count).toFixed(2)
}

function maxJourneyLength (sessions) {
  let max = 0
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].length > max) {
      max = sessions[i].length
    }
  }
  return max
}
