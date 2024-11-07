# Messaging

## Table of contents
- [Back to Architecture](../readme.md)

# Overview

Each message in the system is processed by a function that is dedicated to processing that queue.  The functions are housed under folders in the [tslib source](../../../tslib/).  Queues are hosted in Azure Storage Queues and Azure Service Bus Queues.

## Inventory

| Queue | Location | Publisher(s) | Subscriber |
|---|---|---|---|
| check-started | azure storage | `pupil-spa` | `functions/check-started` |
| pupil-feedback | azure storage | `pupil-spa` | `functions/feedback` |
| pupil-prefs | azure storage | `pupil-spa` | `functions/pupil-prefs` |
| check-completion | service bus | `TODO` | `TODO` |
| check-marking | service bus | `TODO` | `TODO` |
| check-notification | service bus | `TODO` | `TODO` |
| check-submission | service bus | `TODO` | `TODO` |
| check-sync | service bus | `TODO` | `TODO` |
| check-validation | service bus | `TODO` | `TODO` |
| ps-report-schools | service bus | `TODO` | `TODO` |
| ps-report-staging | service bus | `TODO` | `TODO` |
| ps-report-export | service bus | `TODO` | `TODO` |
| ps-report-exec | service bus | `TODO` | `TODO` |
| ps-report-staging-start | service bus | `TODO` | `TODO` |
| ps-report-staging-complete | service bus | `TODO` | `TODO` |
| sync-results-to-db-complete | service bus | `TODO` | `TODO` |

## Queue Definitions

Canonical definitions for all Service Bus & Azure Storage entities are found below...

- [Azure Storage](../../../deploy/storage/tables-queues.json)
- [Service Bus](../../../deploy/service-bus/deploy.config.js)

# Message Schemas

## check-completion
Azure Service Bus queue for signalling that a check has been validated and marked successfully.
This message is work in progress and subject to change.

```typescript
{
  validatedCheck: JSON,
  markedCheck: JSON
}
```

**Consumers**: sync-results-to-sql

**Publishers**: check-marker

## check-marking
Azure Service Bus queue for signalling that a check has been validated and is ready to be marked.

```typescript
{
  schoolUUID: string
  checkCode: string
  version: number
}
```

**Consumers**: check-marker

**Publishers**: check-validator

## check-notification
Azure Service Bus queue for signalling the outcome of a check processing stage so the state can be marshalled to the core database, keeping teachers informed of processing progress.

```typescript
{
  notificationType: checkReceived | checkComplete | checkInvalid
  checkCode: string
  version: number
}
```

**Consumers**: check-notifier-batch

**Publishers**: check-receiver, check-validator, check-marker

## check-started
Azure Storage queue for signaling that the pupil has started official check.

```typescript
{
  version: number
  checkCode: string
  clientCheckStartedAt: Date
}
```

**Consumers**: check-started function

**Publishers**: pupil check application

## check-submission

Service bus queue for submitting checks from the pupil API.

See the [check-submission](./check-submission/readme.md) documentation for full payload schema.

```typescript
{
  version: 3
  checkCode: string
  schoolUUID: string
  archive: string
}
```

**Consumers**: check-receiver function

**Publishers**: pupil check application

## check-sync
Azure Service Bus queue that is used to indicate that a check needs its prepared payload to be synchronised with access arrangements that have been updated.

```typescript
{
  pupilUUID: string
  version: number
}
```

**Consumers**: check-sync function

**Publishers**: pupil-prefs function

## check-validation
Azure Service Bus queue that is used to indicate that a submitted check is ready to be validated.

```typescript
{
  version: number
  checkCode: string
  schoolUUID: string
}
```

**Consumers**: check-validator function

**Publishers**: check-receiver function

## pupil-feedback
Azure Storage queue for submitting feedback from the pupil check application.

```typescript
{
  version: number
  checkCode: string
  inputType: string
  satisfactionRating: string
  comments: string
}
```

**Consumers**: pupil-feedback function

**Publishers**: pupil check application

## pupil-login
Azure Service Bus queue for indicating that a pupil has authenticated and received their prepared check payload.

```typescript
{
  checkCode: string
  loginAt: Date
  version: number
  practice: boolean
}
```

**Consumers**: pupil-login function

**Publishers**: pupil-auth API

## pupil-prefs
Azure Storage queue for submitting access arrangement preferences from the pupil check application for syncing with the core database.

```typescript
{
  checkCode: string
  preferences: {
    colourContrastCode: string | undefined
    fontSizeCode: string | undefined
  }
  version: number
}
```

**Consumers**: pupil-prefs function

**Publishers**: pupil check applicationr

## sync-results-to-db-complete
Azure Service Bus queue for signalling that all checks are processed after the check window has closed.
This is work in progress and not yet well defined.

```typescript
// work in progress, yet to be defined
```

## test-pupil-connection
Azure Storage queue for testing connectivity with azure resources from the pupil check application.

```typescript
{} // No message content
```

**Consumers**: none

**Publishers**: pupil check application



## ps-report-2-pupil-data

Azure Service Bus queue in the psychometric report generation pipeline.  This function takes a school as input and extracts all the information required for the report to ps-report-staging,

```
{
  name: string
  uuid: string
}
```
