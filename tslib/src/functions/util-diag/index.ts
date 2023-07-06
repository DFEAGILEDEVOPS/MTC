import { type Context } from '@azure/functions'
import { readFile } from 'fs'
import { promisify } from 'util'
import { join } from 'path'
const readFileAsync = promisify(readFile)
let buildNumber: string = ''

export default async function (context: Context): Promise<void> {
  context.res = {
    status: 200,
    body: `func-consumption. Build:${await getBuildNumber()}. Node version: ${process.version}`
  }
  context.done()
}

async function getBuildNumber (): Promise<string> {
  if (buildNumber !== '') {
    return buildNumber
  }
  try {
    // expects build.txt to be at the root of the dist folder
    const targetFile = join(__dirname, '..', '..', 'build.txt')
    const result = await readFileAsync(targetFile)
    buildNumber = result.toString()
  } catch {
    buildNumber = 'NOT FOUND'
  }
  return buildNumber
}
