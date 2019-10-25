#!/usr/bin/env node

const getUnixTimeNow = () => Math.round((new Date()).getTime() / 1000)

const displayTime = (secs) => {
  const mins = Math.floor(secs / 60)
  const remainingSecs = (secs % 60)
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
}

async function main () {
  const start = getUnixTimeNow()
  const mockContext = require('../mock-context')
  const v2 = require('./v2')
  await v2.process(mockContext.log)
  const end = getUnixTimeNow()
  const timeTakenSeconds = (end - start) / 60
  console.log('Manual run completed in ', displayTime(timeTakenSeconds))
}

main()
  .then(() => console.log('all done'))
