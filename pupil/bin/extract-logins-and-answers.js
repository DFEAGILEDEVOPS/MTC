#!/usr/bin/env node
'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const config = require('../data/migrations/config');
const LogonEvent = require('../models/logon-event');
const Answers = require('../models/answer');
const csv = require('fast-csv');
const fs = require('fs');
const csvStream = csv.createWriteStream({headers: true});
const writableStream = fs.createWriteStream('out.csv');

writableStream.on("finish", function(){
  console.error("DONE!");
});

csvStream.pipe(writableStream);

mongoose.connect(process.env.MONGO_CONNECTION_STRING, async function(error) {
  if (error) { console.error(error); }

  let answers;

  // extract all complete answers
  try {
    answers = await Answers.find({ result : { $exists : true }, createdAt: {$gt: '2017-05-22 00:00:00'}}).sort({createdAt: 1}).exec();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  for (let index in answers) {
    let answer = answers[index];
    let logonEvent = null;
    if (answer.logonEvent) {
     logonEvent = await getLogon(answer.logonEvent);
    } else {
      console.log(`Logon Event not in schema`);
      logonEvent = {};
    }

    csvStream.write({
      dateTime: answer.answers[0].answerDate,
      pin4Digit: logonEvent.pin4Digit,
      schoolPin: logonEvent.schoolPin,
      pupilPin: logonEvent.pupilPin,
      correctAnswers: answer.result.correct,
      numberOfQuestions: answer.answers.length,
      wrong: answer.answers.filter(ans => {
        return ans.isCorrect === false
      })
        .map(ans => {
          return `${ans.factor1} x ${ans.factor2}`
        }).join(', ')
    });
  };

  csvStream.end();
  mongoose.connection.close();
});


function getLogon(logonEventId) {
  return new Promise(async function (resolve, reject) {
    try {
      let logonEvent = await LogonEvent.findOne({_id: logonEventId}).exec();
      if (!logonEvent) {
        console.log(`Logon Event [${logonEventId}] not found`);
        resolve({});
      }
      // console.log(logonEvent);
      resolve(logonEvent);
    } catch (error) {
      reject(error);
    }
  });
}






