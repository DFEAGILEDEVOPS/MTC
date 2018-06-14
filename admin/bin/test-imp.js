'use strict'

const csv = require('fast-csv')
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const config = require('../config')
const randomGenerator = require('../lib/random-generator')

let parsedData = []
const chars = 'abcdefghijklmnopqrstuwvxyz0123456789'

fs.createReadStream('../NCATools_EduBase_20180604.txt')
    .pipe(csv({ delimiter: '|', headers: true, trim: true }))
    .on('data', (data) => {
        parsedData.push(data)
    })
    .on('end', () => {
        fs.writeFileSync('../NCATools_EduBase_20180604.json', JSON.stringify(parsedData))
    })
