#!/usr/bin/env node

async function main () {
  const mockContext = require('../mock-context')
  const v2 = require('./v2')
  await v2.process(mockContext.log)
}

main()
  .then(() => {
    console.log('all done')
    process.exit(0) // prevent the open DB connections from failing to terminate
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
