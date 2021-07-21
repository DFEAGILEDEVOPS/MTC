# Util Submit Check function

This function is for local dev and automated test scenarios only.  It is disabled by default, and is unavailable in production.

default url: `http://localhost:7071/api/util-submit-check`

accepts: `POST`

content type: `application/json`

## Request body

The request body requires one of 2 values...

### schoolUuid

Submits all prepared checks for a given school, specified by the unique identifier.

example...

```javascript
{
  schoolUuid: 'd83faedf-f217-42d1-b8a5-69ef02ccc594'
}
```

### checkCodes

Submits all specified prepared checks, by check code, as an array.

example...

```javascript
{
  checkCodes: [
    '92f821ba-1946-4af3-99a0-78c2b315e2fa',
    '837032e2-3949-41d3-af12-f92e8b7cead5',
    'cf4b388a-6b98-4c93-8cfa-1a8f52c26f6a'
  ]
}
```

## Important
In order for the check to be properly processed, a successful request to the pupil auth API should be made, in order to set the pupil login date value.

If not, a restart will be unavailable.
