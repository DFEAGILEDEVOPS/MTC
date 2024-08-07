# util-create-taken-check

takes a check code, looks up the prepared check in redis and constructs a 'taken check' with inputs, audits and answers based upon the prepared check.

Returns a JSON structure that is ready for submission, including base64 compressed payload.

## Example input

```javascript
{
  checkCode: 'e27bfa4f-be9c-49ad-9941-b0ee2e1c27be'
}
```

## Example output

```javascript
{
  checkCode: 'e27bfa4f-be9c-49ad-9941-b0ee2e1c27be',
  archive: 'N4IgdghgtgpiBcIICMDGATGAzEAaJAj48ge4hotag9oje4atWWiasSSWIFH49gk59heekuWf49ghlshouKUHKUHrtuios4g5nIgCwDMArCAL5A===',
  schoolUUID: '1519a7e3-c354-4a5f-9210-7dc0b91f29fc',
  version: 3
}
```
