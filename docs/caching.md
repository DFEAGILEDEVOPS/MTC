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
