import { app, HttpHandler, HttpRequest, HttpResponse, InvocationContext } from '@azure/functions'
import * as df from 'durable-functions'
import { type ActivityHandler, OrchestrationContext, type OrchestrationHandler } from 'durable-functions'

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

  // transform the pupils
  const transformPupilTasks: df.Task[] = []
  for (const pupil of pupils) {
    transformPupilTasks.push(context.df.callActivity(transformPupilActivityName, pupil))
  }
  context.log(`attempting to transform ${transformPupilTasks.length} pupils...`)
  const transformedPupils = yield context.df.Task.all(pupils)
  context.log(`total pupils transformed: ${transformedPupils.length}`)

  // write the transformed pupils to blob storage
  const writePupilToBlobTasks: df.Task[] = []
  for (const pupil of transformedPupils) {
    writePupilToBlobTasks.push(context.df.callActivity(writePupilToBlobStorageActivityName, pupil))
  }
  const writeResults = yield context.df.Task.all(writePupilToBlobTasks)
  return writeResults
}

const getPupils: ActivityHandler =  async(input: string): Promise<any[]> => {
  throw new Error('Not implemented yet')
}

const transformPupil: ActivityHandler = async(input: Record<number, any>): Promise<any> => {
  throw new Error('Not implemented yet')
}

const writePupilToBlobStorage: ActivityHandler = async(input: any): Promise<void> => {
  throw new Error('Not implemented yet')
}

// register the durable functions
df.app.orchestration('psreport', psMainOrchestrator)
df.app.activity(getPupilsActivityName, { handler: getPupils })
df.app.activity(transformPupilActivityName, { handler: transformPupil })
df.app.activity(writePupilToBlobStorageActivityName, { handler: writePupilToBlobStorage })

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
