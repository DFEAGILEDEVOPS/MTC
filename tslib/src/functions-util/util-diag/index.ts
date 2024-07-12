import { type HttpRequest, app, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { readFile } from 'fs'
import { promisify } from 'util'
import { join } from 'path'
const readFileAsync = promisify(readFile)
let buildNumber: string = ''

app.http('utilDiag', {
  methods: ['GET'],
  authLevel: 'function',
  handler: utilDiag
})

export async function utilDiag (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  return {
    status: 200,
    body: `func-consumption. Build:${await getBuildNumber()}. Node version: ${process.version}`
  }
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
