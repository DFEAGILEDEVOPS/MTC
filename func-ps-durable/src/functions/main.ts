import { app, HttpHandler, HttpRequest, HttpResponse, InvocationContext, output } from '@azure/functions'
import * as df from 'durable-functions'
import { type ActivityHandler, OrchestrationContext, type OrchestrationHandler } from 'durable-functions'
import { faker } from '@faker-js/faker'

// overall pattern taken from https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-cloud-backup?tabs=javascript-v4

const getPupilsActivityName = 'getPupils'
const transformPupilActivityName = 'transformPupil'
const writePupilToBlobStorageActivityName = 'writePupilToBlobStorage'

// define the durable functions....
const psMainOrchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
  // TODO establish if all schools, or specifics from input
  const input = context.df.getInput()
  context.log(`the main input to the orchestrator is: ${input}`)

  // get all the target pupils dataset
  const pupils = yield context.df.callActivity(getPupilsActivityName, input)
  context.log(`total pupils retrieved: ${pupils.length}`)

  // transform the pupils
  const transformPupilTasks: df.Task[] = []
  for (const pupil of pupils) {
    transformPupilTasks.push(context.df.callActivity(transformPupilActivityName, pupil))
  }
  context.log(`attempting to transform ${transformPupilTasks.length} pupils...`)
  const transformedPupils = yield context.df.Task.all(transformPupilTasks)
  context.log(`total pupils transformed: ${transformedPupils.length}`)

  // write the transformed pupils to blob storage
  const writePupilToBlobTasks: df.Task[] = []
  for (const pupil of transformedPupils) {
    const data: IBlobStorageData = {
      pupil,
      pupilId: pupil.id,
      jobId: context.df.instanceId
    }
    writePupilToBlobTasks.push(context.df.callActivity(writePupilToBlobStorageActivityName, data))
  }
  const writeResults = yield context.df.Task.all(writePupilToBlobTasks)
  return writeResults
}

export class Pupil {
  id: string
  firstName: string
  lastName: string
  dob: Date
}

export class TransformedPupil {
  id: string
  name: string
  age: number
}

const getPupilsHandler: ActivityHandler = async (input: any): Promise<Pupil[]> => {
  const createRandomPupil = () => {
    return {
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dob: faker.date.past({
        years: 36
      })
    }
  }
  const pupilCount = faker.number.int({
    min: Number(process.env.MinimumPupilCount),
    max: Number(process.env.MaximumPupilCount)
  })
  return faker.helpers.multiple(createRandomPupil, {
    count: pupilCount
  })
}

const transformPupilHandler: ActivityHandler = async (input: Pupil): Promise<TransformedPupil> => {
  return {
    id: input.id,
    name: `${input.firstName} ${input.lastName}`,
    age: Math.floor((new Date().getTime() - new Date(input.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
  }
}

const blobOutputBinding = output.storageBlob({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  path: 'pupils-{jobId}/{pupilId}.json'
})

export interface IBlobStorageData {
  pupil: TransformedPupil
  pupilId: string
  jobId: string
}

const writePupilToBlobStorageHandler: ActivityHandler = async (data: IBlobStorageData, context: InvocationContext): Promise<void> => {
  context.log(`writing pupil to blob storage: ${data.pupilId}`)
  context.extraOutputs.set(blobOutputBinding, JSON.stringify(data.pupil))
}

// register the durable functions
df.app.orchestration('psreport', psMainOrchestrator)
df.app.activity(getPupilsActivityName, { handler: getPupilsHandler })
df.app.activity(transformPupilActivityName, { handler: transformPupilHandler })
df.app.activity(writePupilToBlobStorageActivityName, {
  handler: writePupilToBlobStorageHandler,
  extraOutputs: [blobOutputBinding]
})

// define the main trigger / input binding
const psMainHttpStart: HttpHandler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponse> => {
  const client = df.getClient(context)
  const body: unknown = await request.text()
  const instanceId: string = await client.startNew(request.params.orchestratorName, { input: body })
  context.log(`Started orchestration with ID = '${instanceId}'.`)
  return client.createCheckStatusResponse(request, instanceId)
}

// register the main trigger and wire in the orchestrator
app.http('psMainHttpStart', {
  route: 'orchestrators/{orchestratorName}',
  extraInputs: [df.input.durableClient()],
  handler: psMainHttpStart,
})
