'use strict'

const jedit = require('edit-json-file')

const dest = jedit('./package.json')
const src = jedit('../tslib/package.json')
const deps = src.get('dependencies')
console.log('incoming dependencies...')
console.dir(deps)
dest.set('dependencies', deps)
// devDependencies are preserved, as the needs differ between each project
dest.save()
