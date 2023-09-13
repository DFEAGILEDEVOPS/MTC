# MTC Caching

all redis objects are stored as JSON objects containing metadata.
example...

``` javascript
{
  _meta: {
    type: object | number | string | array
  },
  value: string
}
```

## Keys

Key format | parameters | Description
--- | --- | ---
`pupilRegisterViewData:${schoolId}` | schoolId | pupil register view dataset by school id
`prepared-check-lookup:${checkCode}` | checkCode| enables look up of key used to store a prepared check entry by check code
`pupil-uuid-lookup:${checkCode}` | checkCode | enables look up of pupil uuid by a check code
`preparedCheck:${schoolPin}:${pupilPin}` | schoolPin, pupilPin | check payload for a pupil
 `checkForms:${checkWindowId}:live:${isLiveCheck}` | checkWindowId, isLiveCheck | returns active check forms for specified check window and form type
 `sasToken:${queueName}` | queueName | returns the active sas token for the specified storage queue
 `lacodes` | (none) | returns the set of LA codes for schools
`qrcodeurl:${url}` | URL | The url the QR Code should use to direct users to the Pupil App
`result:${schoolId}` | schoolId | returns the school results dataset
`serviceMessage` | (none) | returns the current system wide service message
`settings` | (none) | returns system wide settings
