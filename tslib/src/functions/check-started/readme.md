# Check Started Message Processor

Subscribes to the Azure Storage Queue `check-started`.
Message publisher is the Pupil Check application.

Messages are expected in the following format...

```
{
  version: number
  checkCode: uuid
  clientCheckStartedAt: Date
}
```

## Logic
The check is looked up in the redis cache to determine if the check is in practice or live mode.
If it is a live check, the item is dropped from redis.
If it is a live check, the mtc_admin.check entry has its `startedAt` date populated with the `clientCheckStartedAt` value from the queue message.

PartitionKey: the checkCode of the incoming queue message
RowKey: random uuid
clientCheckStartedAt: a browser client based timestamp of when the 'Start Check' button was pressed
