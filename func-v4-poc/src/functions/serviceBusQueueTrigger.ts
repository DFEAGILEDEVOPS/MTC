import { app, InvocationContext, ServiceBusQueueTrigger, input, output } from "@azure/functions"

const outputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'myoutputqueue'
})

const outputTable = output.table({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  tableName: 'checkResult'
})

const inputReceivedCheckTable = input.table({
  filter: "(PartitionKey eq '{schoolUUID}') and (RowKey eq '{checkCode}')",
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  tableName: 'receivedCheck',
  take: 1
})

app.serviceBusQueue('serviceBusQueueTrigger', {
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'myinputqueue',
  handler: serviceBusQueueTrigger,
  extraOutputs: [outputQueue, outputTable],
  extraInputs: [inputReceivedCheckTable]
});

export async function serviceBusQueueTrigger (message: ServiceBusQueueTrigger, context: InvocationContext): Promise<void> {
  context.log('Message received:', JSON.stringify(message))
  context.extraOutputs.set(outputQueue, message)
  context.extraOutputs.set(outputTable, [{
    PartitionKey: 'messages',
    RowKey: new Date().getTime().toString(),
    Message: message
  }])
}




/* input.generic({
  type: 'table',
  name: 'receivedCheck',
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  filter: "(PartitionKey eq '{schoolUUID}') and (RowKey eq '{checkCode}')",
  take: 1
}) */
