'use strict'

const jedit = require('edit-json-file')

const dest = jedit(`./package.json`)
const src = jedit(`../tslib/package.json`)
const deps = src.get('dependencies')
dest.set('dependencies', deps)
const devDeps = src.get('devDependencies')
dest.set('devDependencies', devDeps)
dest.save()
