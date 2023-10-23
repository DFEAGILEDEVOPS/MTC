
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

## check-submitted

**Deprecated** - see `check-submission` below
Azure Storage queue for submitting checks from the pupil check application.

See the [check-submission](./check-submission/readme.md) documentation for full payload schema.

```typescript
{
  version: 2
  checkCode: string
  schoolUUID: string
  archive: string //zipped copy of submitted check JSON structure
}
```

**Consumers**: check-receiver function

**Publishers**: pupil check application

## check-submission

Service bus queue for submitting checks from the pupil API.

See the [check-submission](./check-submission/readme.md) documentation for full payload schema.

```typescript
{
  version: 3
  checkCode: string
  schoolUUID: string
  // TODO
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

**Publishers**: pupil check application

## school-results-cache
Azure Service Bus queue for signalling that results for a school should be created and cached, as all pupils have a marked check.

```typescript
{
  schoolGuid: string
  schoolName: string
}
```

**Consumers**: school-results-cache function

**Publishers**: school-results-cache-determiner

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

