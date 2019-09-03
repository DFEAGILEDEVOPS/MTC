import { AzureFunction, Context } from "@azure/functions"
import { MarkCheckMessageV1 } from "../typings/message-schemas";

const serviceBusQueueTrigger: AzureFunction = async function(context: Context, markCheckMessage: MarkCheckMessageV1): Promise<void> {
  context.log.warn(`check marking not yet implemented`)
};

export default serviceBusQueueTrigger;
