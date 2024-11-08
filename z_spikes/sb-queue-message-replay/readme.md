# Service Bus Queue Message Replay

Spike on establishing how to replay messages that ended up on the dead letter queue.

The implementation works for any Azure Service Bus Queue.

To use this poc, create a queue called `message-replay-testing`.

## Message Receiver

Dual purpose http triggered function...
  - drain a queue by reading messages (default)
  - force messages onto dead letter queue

in order to force messages onto the dead letter queue, append `?fail=true` onto the URL when calling.

## Message Sender

Creates messages and puts them onto the queue.  5 by default

## Poison Reader

Peeks all messages on the queue and outputs the message body.

## Poison Replay

Takes all messages on the dead letter queue and replays them back onto the main queue, in batches.
