# Message standards

Outlines standard practice for messaging in MTC.

## Logging

Do not log the entire message object, as the output becomes too verbose.
Try to keep it to a single line entry that includes the `checkCode` or `id` of related object for tracing purposes and `version` property for schema correlation.

## Versioning

Each function has a `message-schema` folder that contains the current version and all previous versions.
Ensure each message created contains a `version` property that corresponds to the current schema.
