import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const count = (req.query.count || 50);
    context.bindings.checkStartedQueue = [];
    for (let index = 0; index < count; index++) {
        context.bindings.checkStartedQueue.push(`message ${index}`)
    }
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: `${count} messages added to queue`
    };
};

export default httpTrigger;