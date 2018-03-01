const winston = require('winston')
const fs = require('fs-extra')

async function main () {
  try {
    winston.info('Cleaning reports directory...')
    await fs.emptyDir('../Jmeter/reports')
    winston.info('DONE')
    process.exit(0)
  } catch (error) {
    winston.info(error)
    process.exit(1)
  }
}

main()
