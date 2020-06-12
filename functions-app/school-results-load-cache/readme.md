# school-results-load-cache

Implemented on a TimerTrigger, this function will load the cache overnight so that school results are available for the
start of the day.

## Configuration

* env var `SCHOOL_RESULTS_CACHE_LOAD_ASYNC_LIMIT` - int - determines the number of concurrent schools that are
  processed. Default is 6.

* env var `REDIS_RESULTS_EXPIRY_IN_SECONDS` - int - determines the TTL in seconds the school result data is cached for
  in Redis.  Default is 15778800 seconds - 6 months.
