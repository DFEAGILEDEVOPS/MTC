# Environment variables used in the MTC solution

## Components shorthand

* **FT** - functions throttled 
* **FC** - functions consumption
* **AA** - admin app
* **PA** - pupil app (SPA)
* **PAPI** - pupil API 

## Types 
All environment variables are strings, but they are converted to appropriate types in the component at startup.

Booleans can be set to the string `'true'` or `'false'` or numeric `1` or `0` which will be converted from a string
 to the equivalent boolean value.

Env Var | Type | Default value | Required | Components | Description 
--- | --- | --- | --- | --- | ---
ALLOWED_WORDS | String | 'aaa,bbb,ccc,ddd,eee,dim' | Required | FC | Required to generated random school pins in the form WORD + NUMBER + NUMBER + WORD
AZURE_SERVICE_BUS_CONNECTION_STRING | String | NULL | Required | AA, FC, FT, PAPI | Connection string as given in the Azure portal for Azure Service Bus.
AZURE_STORAGE_CONNECTION_STRING | String | (empty string) | Required | AA, FC, FT | The Azure storage connection string.
BANNED_WORDS | String | 'dim' | Optional | FC | Provides a way to negate words that may be in the allowed list ensuring that they never appear in a pin.
CHECK_ALLOCATION_EXPIRY_SECONDS | Int | 15778476 | Optional | none | The number of seconds to cache the pupil check in Redis for before expiring it. Possibly no longer used.
CHECK_COMPLETION_QUEUE_MAX_DELIVERY_COUNT | Int | 10 | Optional | FT | Taken from the `check-completion` Azure service bus queue: maxDeliveryCount
CHECK_NOTIFIER_BATCH_COUNT | Int | 5 | Optional | FC | Tune the number of batches of messages the check-notifier service fetches per invocation.  The check-notifier service is run regularly from a timer trigger.
CHECK_NOTIFIER_MESSAGES_PER_BATCH | Int | 32 | Optional |  FC | Tune the number of messages the check-notifier service fetches per query.
CORS_WHITELIST | String | (empty string) | Required | AA, PAPI | Comma separated string of URLs allowed to access the service being protected.
DEBUG_VERBOSITY | Int | 1 | Optional | AA, FC, FT | Set to 0 for now additional logging, 1 for more verbosity, and 2 to see SQL queries (requires the LOGLEVEL set to debug)
DEBUG_VERBOSITY | Int | 1 | Optional | FC, FT | When LOG_LEVEL is set to 'debug' use DEBUG_VERBOSITY to increase or decrease the logging verbosity.  Set to 2 to have the SQL queries sent to the log.
ENVIRONMENT_NAME | String | 'Local-Dev' | Optional | FC, FT | 
GIAS_WS_EXTRACT_ID | Int | 0 | Optional | none | Gias synchronisation.  **Not Used**.
GIAS_WS_MESSAGE_EXPIRY_MS | Int | 10000 | Required | none | Gias synchronisation.  **Not Used**. XML Message expiry in milliseconds.
GIAS_WS_NAMESPACE | String | NULL | Required | none | Gias synchronisation. **Not Used**. This value is used in the XML namespace when making requests.
GIAS_WS_PASSWORD | String | NULL | Required | none | Gias synchronisation.  **Not Used**.
GIAS_WS_REQUEST_TIMEOUT | Int | 30000 | Required| none | Gias synchronisation. **Not Used**.  Timeout in milliseconds when making the request.
GIAS_WS_SERVICE_URL | String | NULL | Required | none | Gias synchronisation.  **Not Used**.  The URL of the GIAS service.
GIAS_WS_USERNAME | String | NULL | Required | none | Gias synchronisation. **Not Used**. 
OVERRIDE_PIN_EXPIRY | Boolean | false | Optional | FC | Developer setting to allow pin generation after 4PM
PIN_UPDATE_MAX_ATTEMPTS | Int | 0 | Optional | FC |  The number of school pin updates to attempt in case of a pin collision (as pins are generated randomly). If set to zero, then the number of attempts is calculated as the total number of permutations available.
PREPARED_CHECK_EXPIRY_SECONDS | Int | 1800 | Optional | PAPI | Once a pupil logs in a live check the expiry in Redis is set to this value. Default is 1800 seconds (30 minutes).
REDIS_HOST | String | NULL | Required | AA, FC, FC, PAPI | The redis hostname or IP address.
REDIS_KEY | String | NULL | Optional | AA, FC, FT, PAPI | The redis secret key to use to connect to a password enabled Redis server.
REDIS_PORT | Int | 6379 | Optional | AA, FC, FT, PAPI | The redis port to connect to.
REDIS_RESULTS_EXPIRY_IN_SECONDS | Int | 15778800 | Optional | FC | The TTL of the school results object in Redis.  Default is six months.
RETRY_MAX_ATTEMPTS | Int | 3 | Optional | FC, FT | The number of retry attempts to make is the SQL Server is unavailable due to resource constraints.
RETRY_PAUSE_MS | Int | 5000 | Optional | AA, FC, FT | The number of milliseconds to pause because making the first retry attempt to the Database.  FC and FT default to 5 seconds.
RETRY_PAUSE_MULTIPLIER | Float | 1.5 | Optional| AA, FC, FT | The multipland to multiply the RETRY_PAUSE_MS number by for successive retry attempts after the first one.  So using the defaults provided: the initial query will have 0 ms delay, then 5000 ms delay, then 7,500 ms delay then 11,250 for FC and FT.   
SCHOOL_PIN_FUNCTION_ENABLED | Boolean | false | Optional | FC | Used by the Developer Test tools
SCHOOL_PIN_SAMPLER_FUNCTION_ENABLED | Boolean | false | Optional | FC | Used by the Developer Test tools
SCHOOL_RESULTS_CACHE | Int | 1 | Optional | FC | Used by the school results cache determiner.  Set to 0 to never cache, 1 to cache if the date is between the end of the check and the first Monday after the check has ended, or 2 to never cache.
SCHOOL_RESULTS_CACHE_BATCHS_PER_EXEC | Int | 10 |  Optional | FC | Tune the number of batches of messages the school-results-cache service fetches per invocation.  The  service is run regularly from a timer trigger.
SCHOOL_RESULTS_CACHE_MSGS_PER_BATCH | Int | 32 | Optional | FC | Tune the number of messages the school-results-cache service fetches per query.
SQL_APP_NAME | String | Various | Suggested | AA, FC, FT | Used to provide the app name to SQL Server
SQL_CENSUS_REQUEST_TIMEOUT | Int | 60000 * 120 | Optional | FC | The timeout in milliseconds for a single request to the database.  This is used purely by the pupil census upload.  Value in milliseconds.
SQL_CONNECTION_TIMEOUT | Int | 60000 | Optional| AA, FC, FT | The timeout value in milliseconds to allow when opening a connection to the database.  Default is 1 minute in ms for FT and FC.
SQL_DATABASE | String | mtc | Required | AA, FC, FT | Database name to connect to
SQL_ENABLE_ARITH_ABORT | Boolean | true | Optional | AA, FC, FT | [Used by the TDS library](https://tediousjs.github.io/tedious/api-connection.html)
SQL_ENCRYPT | Boolean | true | Optional | AA, FC, FT | Whether to use TLS encryption when connecting to the Database.  Azure SQL Server requires `true`.  Can be set to false for local developmnent only.
SQL_FUNCTIONS_APP_USER | String | NULL | Required | FC, FT | SQL user name
SQL_FUNCTIONS_APP_USER_PASSWORD | String | NULL | Required | FC, FT | SQL user password
SQL_POOL_LOG_ENABLED | Boolean | Various | Optional | AA, FC, FT | 
SQL_POOL_MAX_COUNT | Int | Various | Optional | AA, FC, FT | Maximum number of connections to keep open in the SQL connection pool. FT and FC default to 10.
SQL_POOL_MIN_COUNT | Int | Various | Optional | AA, FC, FT | Minimum number of connections to keep open in the SQL connection pool.  FT and FC default to 5.
SQL_PORT | Int | 1433 | Required | AA, FC, FT | Port the SQL Server is open on
SQL_PUPIL_CENSUS_USER | String | NULL | Required | FC | SQL user to import the pupil census.
SQL_PUPIL_CENSUS_USER_PASSWORD | String | NULL | Required | FC | SQL user password for the pupil census user.
SQL_REQUEST_TIMEOUT | Int | 60000 | Optional | AA, FC, FT | Request timeout in milliseconds for requests made to the database.
SQL_SERVER | String | localhost | Required | AA, FC, FT | SQL Server hostname or IP address 
SUBMIT_CHECK_FUNCTION_ENABLED | Boolean | false | Optional | FC | Used by the Developer Test tools
