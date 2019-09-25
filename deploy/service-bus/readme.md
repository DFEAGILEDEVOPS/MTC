# Service bus queue creation utility script

Creates service bus queues defined in queues-topics.json, if they do not already exist.

## Environment variables

`AZURE_SERVICEBUS_CONNECTION_STRING` - required.  Connection string for service bus instance with `manage` permissions granted.

## Usage

`yarn deleteqs` or `npm run deleteqs` - deletes all queues specifieid in `queues-topics.json`
`yarn createqs` or `npm run createqs` - creates all queues specifieid in `queues-topics.json`

## Queue policies

See the [official documentation](https://azure.github.io/azure-sdk-for-node/azure-sb/latest/ServiceBusService.html#createQueueIfNotExists) for details on queue policies / behaviours.
Time based values are denoted in [ISO8061 format](https://www.digi.com/resources/documentation/digidocs/90001437-13/reference/r_iso_8601_duration_format.htm)

