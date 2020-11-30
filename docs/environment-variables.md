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
CHECK_COMPLETION_QUEUE_MAX_DELIVERY_COUNT | Int | 10 | Optional | FT | Taken from the `check-completion` Azure service bus queue: maxDeliveryCount
DEBUG_VERBOSITY | Int | 1 | Optional | AA, FC, FT | Set to 0 for now additional logging, 1 for more verbosity, and 2 to see SQL queries (requires the LOGLEVEL set to debug)
ENVIRONMENT_NAME | String | 'Local-Dev' | Optional | FC, FT | 
SQL_FUNCTIONS_APP_USER | String | NULL | Required | FC, FT | SQL user name
SQL_FUNCTIONS_APP_USER_PASSWORD | String | NULL | Required | FC, FT | SQL user password
SQL_SERVER | String | localhost | Required | AA, FC, FT | SQL Server hostname or IP address 
SQL_PORT | Int | 1433 | Required | AA, FC, FT | Port the SQL Server is open on
SQL_DATABASE | String | mtc | Required | AA, FC, FT | Database name to connect to
SQL_CONNECTION_TIMEOUT | Int | 60000 | Optional| AA, FC, FT | The timeout value in milliseconds to allow when opening a connection to the database.  Default is 1 minute in ms for FT and FC.
SQL_CENSUS_REQUEST_TIMEOUT | Int | 60000 * 120 | Optional | FC | The timeout in milliseconds for a single request to the database.  This is used purely by the pupil census upload.  Value in milliseconds.
SQL_REQUEST_TIMEOUT | Int | 60000 | Optional | AA, FC, FT | Request timeout in milliseconds for requests made to the database.
SQL_ENCRYPT | Boolean | true | Optional | AA, FC, FT | Whether to use TLS encryption when connecting to the Database.  Azure SQL Server requires `true`.  Can be set to false for local developmnent only.
SQL_APP_NAME | String | Various | Suggested | AA, FC, FT | Used to provide the app name to SQL Server
SQL_ENABLE_ARITH_ABORT | Boolean | true | Optional | AA, FC, FT | [Used by the TDS library](https://tediousjs.github.io/tedious/api-connection.html)
SQL_POOL_MIN_COUNT | Int | Various | Optional | AA, FC, FT | Minimum number of connections to keep open in the SQL connection pool.  FT and FC default to 5.
SQL_POOL_MAX_COUNT | Int | Various | Optional | AA, FC, FT | Maximum number of connections to keep open in the SQL connection pool. FT and FC default to 10.
SQL_POOL_LOG_ENABLED | Boolean | Various | Optional | AA, FC, FT | 
SQL_PUPIL_CENSUS_USER | String | NULL | Required | FC | SQL user to import the pupil census.
SQL_PUPIL_CENSUS_USER_PASSWORD | String | NULL | Required | FC | SQL user password for the pupil census user.
RETRY_MAX_ATTEMPTS | Int | 3 | Optional | FC, FT | The number of retry attempts to make is the SQL Server is unavailable due to resource constraints.
RETRY_PAUSE_MS | Int | 5000 | Optional | AA, FC, FT | The number of milliseconds to pause because making the first retry attempt to the Database.  FC and FT default to 5 seconds.
RETRY_PAUSE_MULTIPLIER | Float | Optional | 1.5 | AA, FC, FT | The multipland to multiply the RETRY_PAUSE_MS number by for successive retry attempts after the first one.  So using the defaults provided: the initial query will have 0 ms delay, then 5000 ms delay, then 7,500 ms delay then 11,250 for FC and FT.   
REDIS_HOST | String | NULL | Required | AA, FC, FC, PAPI | The redis hostname or IP address.
REDIS_PORT | Int | 6379 | Optional | AA, FC, FT, PAPI | The redis port to connect to.
REDIS_KEY | String | NULL | Optional | AA, FC, FT, PAPI | The redis secret key to use to connect to a password enabled Redis server.
CHECK_ALLOCATION_EXPIRY_SECONDS | Int | 15778476 | Optional | none | The number of seconds to cache the pupil check in Redis for before expiring it. Possibly no longer used.

