'use strict'
const R = require('ramda')

// In a real implementation these words would come from the environment
const words = [
  'aaa',
  'bcd',
  'dcd',
  'tfg',
  'bxx',
  'foo',
  'bar',
  'baz',
  'zab',
  'rab',
  'cet',
  'rep',
  'waf',
  'cdr',
  'str',
  'piq',
  'sah',
  'inn',
  'tej',
  'tyl'
]

const numbers = '23456789'

/**
 * Enumerate the entire pin space
 * @param words
 * @param numbers
 * @return {Array}
 */
function generateAllSchoolPasswords(words, numbers) {
  let firstWord, secondWord, firstNumber, secondNumber, secondPot
  const numberList = R.split("", numbers)
  const output = []
  for (let i = 0; i < words.length; i++) {
    firstWord = words[ i ]
    secondPot = R.without([firstWord], words)
    for (let j = 0; j < secondPot.length; j++) {
      secondWord = secondPot[ j ]
      for (let k = 0; k < numberList.length; k++) {
        firstNumber = numberList[ k ]
        for (let l = 0; l < numberList.length; l++) {
          secondNumber = numberList[ l ]
          output.push(`${firstWord}${firstNumber}${secondNumber}${secondWord}`)
        }
      }
    }
  }
  return output
}

function generateDML(pins) {
  const insertPin = x => `INSERT INTO [mtc_admin].[schoolPin] (schoolPin) VALUES ('${x}');`
  return R.map(insertPin, pins)
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

;(function main() {
  const pins = generateAllSchoolPasswords(words, numbers)
  const dml = generateDML(shuffle(shuffle(shuffle(pins))))
  console.log(dml.join("\n"))
})()
