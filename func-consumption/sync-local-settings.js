'use strict'

const jedit = require('edit-json-file')

// if the destination file does not exist it will be created
const dest = jedit('./local.settings.json')
const src = jedit('./package.json')
const defaultValues = src.get('function-settings')
dest.set('Values', defaultValues, {
  merge: true
})
dest.save()
