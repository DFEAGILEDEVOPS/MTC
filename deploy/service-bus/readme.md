# Service bus queue creation utility script

Creates service bus queues defined in queues-topics.json, if they do not already exist.

## Environment variables

`AZURE_SERVICEBUS_CONNECTION_STRING` - required.  Connection string for service bus instance with `manage` permissions granted.

## Queue policies

`MaxSizeInMegabytes` - max queue size
`DefaultMessageTimeToLive` - how long the message stays on the queue before expiry in [ISO8061 format](https://www.digi.com/resources/documentation/digidocs/90001437-13/reference/r_iso_8601_duration_format.htm)
