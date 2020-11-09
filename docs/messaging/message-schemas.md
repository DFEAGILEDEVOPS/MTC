
# Message Schemas

## check-completion
Azure Service Bus queue for signalling that a check has been validated and marked successfully.

**Consumers**:

**Publishers**:

## check-marking
Azure Service Bus queue for signalling that a check has been validated and is ready to be marked.

**Consumers**:

**Publishers**:

## check-notification
Azure Service Bus queue for signalling the outcome of a check processing stage after submission from the pupil check application.

```typescript
notificationType: checkReceived | checkComplete | checkInvalid
checkCode: string
version: number
```

**Consumers**:

**Publishers**:

## check-started
Azure Storage queue for signaling that the pupil has started official check.

```typescript
version: number
checkCode: string
clientCheckStartedAt: Date
```

**Consumers**: check-started function

**Publishers**: pupil check application

## check-submitted
Azure Storage queue for submitting checks from the pupil check application.
```typescript
version: number
checkCode: string
schoolUUID: string
archive: string //zipped copy of submitted check JSON structure
```

**Consumers**: check-receiver function

**Publishers**: pupil check application

## check-sync
Azure Service Bus queue that is used to indicate that a check needs its prepared payload to be synchronised with access arrangements that have been updated.
```typescript
pupilUUID: string
version: number
```

**Consumers**: check-sync function

**Publishers**: pupil-prefs function

## check-validation
Azure Service Bus queue that is used to indicate that a submitted check is ready to be validated.
```typescript
version: number
checkCode: string
schoolUUID: string
```

**Consumers**: check-validator function

**Publishers**: check-receiver function

## pupil-feedback
Azure Storage queue for submitting feedback from the pupil check application.

**Consumers**:

**Publishers**:

## pupil-login


## pupil-prefs
Azure Storage queue for submitting access arrangement preferences from the pupil check application for syncing with the core database.

## school-results-cache

## sync-results-to-db-complete


## test-pupil-connection
Azure Storage queue for testing connectivity with azure resources from the pupil check application.
