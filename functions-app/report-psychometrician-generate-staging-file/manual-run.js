#!/usr/bin/env node

async function main () {
  const mockContext = require('../mock-context')
  const v1 = require('./v1')
  await v1.process(mockContext.log)
}

main()
  .then(() => {
    console.log('all done')
    process.exit(0)
  })
