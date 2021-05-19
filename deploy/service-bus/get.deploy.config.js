'use strict'

// allows easy access to a JSON object of the config from the shell to enable access from Ruby or other languages

const config = require('./deploy.config')
console.log(JSON.stringify(config, null, 2))
