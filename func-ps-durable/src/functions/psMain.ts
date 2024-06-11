import { app, HttpHandler, HttpRequest, HttpResponse, InvocationContext } from '@azure/functions';
import * as df from 'durable-functions';
import { type ActivityHandler, OrchestrationContext, type OrchestrationHandler } from 'durable-functions';

const activityName = 'psMain';

// define the durable functions....
const psMainOrchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
    const outputs = [];
    outputs.push(yield context.df.callActivity(activityName, 'Tokyo'));
    outputs.push(yield context.df.callActivity(activityName, 'Seattle'));
    outputs.push(yield context.df.callActivity(activityName, 'Cairo'));

    return outputs;
};

const psMain: ActivityHandler = (input: string): string => {
  return `Hello, ${input}`;
};

// register the durable functions
df.app.orchestration('psMainOrchestrator', psMainOrchestrator);
df.app.activity(activityName, { handler: psMain });

// define the main trigger / input binding
const psMainHttpStart: HttpHandler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponse> => {
    const client = df.getClient(context);
    const body: unknown = await request.text();
    const instanceId: string = await client.startNew(request.params.orchestratorName, { input: body });
    context.log(`Started orchestration with ID = '${instanceId}'.`);
    return client.createCheckStatusResponse(request, instanceId);
};

// register the main trigger and wire in the orchestrator
app.http('psMainHttpStart', {
    route: 'orchestrators/{orchestratorName}',
    extraInputs: [df.input.durableClient()],
    handler: psMainHttpStart,
});
