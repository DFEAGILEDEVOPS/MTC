# Util Submit Check function

This function is for local dev and automated test scenarios only.  It is disabled by default, and is unavailable in production.
To enable it, the `TEST_SUPPORT_API_ENABLED` environment variable must be set to `true`.

## Description

This function is for emulating the check submission process, normally undertaken by a pupil using a web browser, once the check has been completed.
It allows you to bypass the often complex process of generating a valid completed check, compressing the payload and submitting it to the queue endpoint.  This provides a consistent single reference for load, volume and integration test tools to utilise in scenarios.

default url: `http://localhost:7071/api/util-submit-check`

accepts: `POST`

content type: `application/json`

## Request body

The request body supports the following parameters...

```javascript
{
  schoolUuid: 'uuid',
  checkCodes: ['uuid1', 'uuid2', ...],
  answerNumberFromCorrectCheckForm,
  answerNumberFromIncorrectCheckForm,
  answerNumberOfDuplicates
}
```

### schoolUuid

Optional when `checkCodes` not provided.
looks up all prepared checks at the given school, specified by the unique identifier.
All prepared checks are submitted.
when this is specified the `checkCodes` parameter is not required.

example...

```javascript
{
  schoolUuid: 'd83faedf-f217-42d1-b8a5-69ef02ccc594',
  ...
}
```

### checkCodes

Optional when `schoolUuid` not provided.
Submits all specified prepared checks, by check code.

example...

```javascript
{
  checkCodes: [
    '92f821ba-1946-4af3-99a0-78c2b315e2fa',
    '837032e2-3949-41d3-af12-f92e8b7cead5',
    'cf4b388a-6b98-4c93-8cfa-1a8f52c26f6a'
  ],
  ...
}
```

### answerNumberFromCorrectCheckForm

Forced number of correct answers.

example...

```javascript
{
  answerNumberFromCorrectCheckForm: 5
  ...
}
```

### answerNumberFromIncorrectCheckForm

Forced number of incorrect answers.

example...

```javascript
{
  answerNumberFromIncorrectCheckForm: 3
  ...
}
```

### answerNumberOfDuplicates

Forced number of duplicate answers.

example...

```javascript
{
  answerNumberOfDuplicates: 3
  ...
}
```

## Notes
In order for the check to be properly processed, a successful request to the pupil auth API should be made (typically prior to the check submission), in order to set the pupil login date value.

If not, a restart will be unavailable, as it will not be possible to determine that the check has been consumed.

If submitting a [check-started message](../messaging/message-schemas.md) is part of your automated process, you should set the `TEST_SUPPORT_DISABLE_PREPARED_CHECK_CACHE_DROP` environment variable to `true` so that the `check-started` function does not drop the prepared check before the `util-submit-check` function can use it to generate a complete check.


## Roadmap
Invalid payload generation and structures that mimic real world examples of faulty payloads seen in live check periods.

