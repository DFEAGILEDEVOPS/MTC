# MTC Caching

all redis objects are stored as JSON objects containing metadata.
example...

``` javascript
{
  _meta: {
    type: object | number | string | array,
    ttl: number
  },
  value: {
  }
}
```

### owner

who creates and maintains the cache entry. Possible values...
- sql: the data is stored in sql server, but may be consumed by any application within the solution
- func-consumption: the func-consumption app
- admin
- pupil-api
- functions
- functions-app
