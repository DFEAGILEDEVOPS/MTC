# Environment variables used in the MTC solution

## Components shorthand

* **FT** - functions throttled
* **FC** - functions consumption
* **FP** - functions PS Report
* **AA** - admin app
* **PA** - pupil app (SPA)
* **PAPI** - pupil API

## Types
All environment variables are strings, but they are converted to appropriate types in the component at startup.

Booleans can be set to the string `'true'` or `'false'` or numeric `1` or `0` which will be converted from a string
 to the equivalent boolean value.

Env Var | Type | Default value | Required | Components | Description
--- | --- | --- | --- | --- | ---
 ADMIN_SESSION_DISPLAY_NOTICE_AFTER | Int | 300 | Optional | AA | Show a notice to the user that their session is about to end this many seconds before the session expires.
 ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS | Int | 600 | Optional | AA | The session will expire after this many seconds of inactivity.
 ALLOWED_WORDS | String | FC:'aaa,bbb,ccc,ddd,eee,dim'<br />AA:'aaa,bcd,dcd,tfg,bxx' | Required | FC | Required to generated random school pins in the form WORD + NUMBER + NUMBER + WORD
 APPINSIGHTS_COLLECT_DEPS | Boolean | true | Optional | AA | Set to false if you do not want App Insights to collect dependency information.
 APPINSIGHTS_COLLECT_EXCEPTIONS | Boolean | true | Optional | AA | Set to false if you do not want App Insights to collect exception information.
 APPINSIGHTS_INSTRUMENTATIONKEY | String | NULL | Optional | AA,PA | The Azure Application Insights account key, required for logging / monitoring.
 APPINSIGHTS_LIVE_METRICS | Boolean | true | Optional | AA | Set to false if you do not want App Insights to collection live metrics.
 APPINSIGHTS_WINSTON_LOGGER | Boolean | false | Optional | AA | Boolean flag.  Set to 1 to allow the winston logger to send to Application Insights, or 0 to disable. If enabled, you should also set `EXPRESS_LOGGING_WINSTON`to `1` and `APPINSIGHTS_INSTRUMENTATIONKEY`to  the Azure-specified value.
 ASSET_PATH | String | / | Required | AA | The URL to the admin container that serves static assets: css, js, images.
 AUTH_MODE | String | local | Optional | AA | Valid modes are `local` and `dfe`.
 AZURE_QUEUE_PREFIX | String | '' | Optional | AA | A prefix that can be automatically applied to the required queues.
 AZURE_SERVICE_BUS_CONNECTION_STRING | String | NULL | Required | AA, FC, FT, PAPI | Connection string as given in the Azure portal for Azure Service Bus.
 AZURE_STORAGE_CONNECTION_STRING | String | (empty string) | Required | AA, FC, FT | The Azure storage connection string.
 AZURE_TABLE_PREFIX | String | '' | Optional | AA | A prefix that can be automatically applied to the required tables.
 AZURE_ACCOUNT_NAME | String | '' | Required | PA | The string provided will be inserted into the template string `https://<azure_account_name>.queue.core.windows.net/$1` and used a a fallback proxy for the check-submitted queue.<br />E.g. `testsamtc` for the test instance
 BANNED_WORDS | String | 'dim' | Optional | FC | Provides a way to negate words that may be in the allowed list ensuring that they never appear in a pin.
 CHECK_ALLOCATION_EXPIRY_SECONDS | Int | 15778476 | Optional | none | The number of seconds to cache the pupil check in Redis for before expiring it. Possibly no longer used.
 CHECK_COMPLETION_QUEUE_MAX_DELIVERY_COUNT | Int | 10 | Optional | FT | Taken from the `check-completion` Azure service bus queue: maxDeliveryCount
 CHECK_NOTIFIER_BATCH_COUNT | Int | 5 | Optional | FC | Tune the number of batches of messages the check-notifier service fetches per invocation.  The check-notifier service is run regularly from a timer trigger.
 CHECK_NOTIFIER_MESSAGES_PER_BATCH | Int | 32 | Optional |  FC | Tune the number of messages the check-notifier service fetches per query.
 CORS_WHITELIST | String | (empty string) | Required | AA, PAPI | Comma separated string of URLs allowed to access the service being protected.
 DEBUG_VERBOSITY | Int | 1 | Optional | AA,FC, FT | When LOG_LEVEL is set to 'debug' use DEBUG_VERBOSITY to increase or decrease the logging verbosity.  Set to 2 to have the SQL queries sent to the log.
 DFE_SIGNON_AUTH_URL | String | N/A | Optional | AA | Custom authentication
 DFE_SIGNON_CLIENT_ID | String | N/A | Optional | AA | Custom authentication
 DFE_SIGNON_CLIENT_SECRET | String | N/A | Optional | AA | Custom authentication
 DFE_SIGNON_CLOCK_TOLERANCE_SECONDS | Int | 300 | Optional | AA | Custom authentication
 DFE_SIGNON_DISCOVERY_TIMEOUT_MS | Int | 10000 | Optional | AA | Custom authentication
 DFE_SIGNON_OPENID_SCOPE | String | 'openid profile email organisation' | Optional | AA | Custom authentication
 DFE_SIGNON_SERVICES_URL | String |  |  |  | Custom authentication
 DFE_SIGNON_SIGNOUT_URL | String |  |  |  | Custom authentication
 DFE_USER_INFO_API_SECRET | String |  |  |  | Custom authentication
 DFE_USER_INFO_API_TOKEN_AUDIENCE | String |  |  |  | Custom authentication
 DFE_USER_INFO_API_URL | String |  |  |  | Custom authentication
 ENVIRONMENT_NAME | String | 'Local-Dev' | Optional | AA,FC, FT | The environment name.
 EXPRESS_LOGGING_WINSTON | Boolean | false | Optional | AA | Logging in the Admin app uses either Winston (intended for production) or moran (intended for local development).  Winston log transports can be configured to be sent to Azure, whereas morgan logs to the console.
 FEATURE_TOGGLE_ACCESS_ARRANGEMENTS | Boolean | true | Optional | AA | Enable / disable the pages to set access arrangements on pupil checks
 FEATURE_TOGGLE_GROUP_CREATE | Boolean | true | Optional | AA | Enable / disable the new groups to be added.
 FEATURE_TOGGLE_GROUP_EDIT | Boolean | true | Optional | AA | Enable / disable the new groups to be edited (e.g. adding or removing pupils)
 FEATURE_TOGGLE_GROUP_REMOVE | Boolean | true | Optional | AA | Enable / disable the remove a group feature.
 FEATURE_TOGGLE_NEW_CHECK_WINDOW | Boolean | true | Optional | AA | Enable / disable the check window functions (add, edit, remove)
 FEATURE_TOGGLE_PUPIL_EDIT | Boolean | true | Optional | AA | Enable / disable the ability to edit pupil information
 FEATURE_TOGGLE_SCHOOL_HOME_VIEW_V2 | Boolean | true | Optional | AA | Not used?
 FEATURE_TOGGLE_SCHOOL_PIN_GEN_FALLBACK | Boolean | false | Optional | AA | When enabled this feature flag will detect when a school does not a pin during pin generation and use a fallback method to create one.
 FEATURE_TOGGLE_SCHOOL_RESULTS_ALLOW_FETCH_FROM_DB | Boolean | true | Optional | AA | When enabled this feature flag will enable school results to be retrieved from the database in the event of a cache miss.
 GIAS_WS_EXTRACT_ID | Int | 0 | Optional | none | Gias synchronisation.  **Not Used**.
 GIAS_WS_MESSAGE_EXPIRY_MS | Int | 10000 | Required | none | Gias synchronisation.  **Not Used**. XML Message expiry in milliseconds.
 GIAS_WS_NAMESPACE | String | NULL | Required | none | Gias synchronisation. **Not Used**. This value is used in the XML namespace when making requests.
 GIAS_WS_PASSWORD | String | NULL | Required | none | Gias synchronisation.  **Not Used**.
 GIAS_WS_REQUEST_TIMEOUT | Int | 30000 | Required| none | Gias synchronisation. **Not Used**.  Timeout in milliseconds when making the request.
 GIAS_WS_SERVICE_URL | String | NULL | Required | none | Gias synchronisation.  **Not Used**.  The URL of the GIAS service.
 GIAS_WS_USERNAME | String | NULL | Required | none | Gias synchronisation. **Not Used**.
 GOOGLE_TRACKING_ID | String | NULL | Optional | AA | The Google tracking identifier
 HELPLINE_NUMBER | String | '0300 303 3013' | Optional | AA | The telephone number of the helpdesk.
 JWT_TIMEOUT_HOURS | Int | 12 | Optional | AA | Not used.
 LINES_PER_CHECK_FORM | Int | 25 | Optional | AA | The number of lines required in an uploaded check-form.Equivalent to the number of questions on the form.
 LOG_LEVEL | String | 'info' | Optional | AA | Available log levels are: `emerg`, `alert`, `crit`, `error`, `warning`, `notice`, `info`, `debug`
 OVERRIDE_PIN_EXPIRY | Boolean | false | Optional | AA | **Developer Setting**<br />Allow pins to be generated after 4pm, allow checks to be taken after 4pm
 OVERRIDE_PIN_EXPIRY | Boolean | false | Optional | FC | Developer setting to allow pin generation after 4PM
 OVERRIDE_PIN_VALIDITY_TIME | Boolean | false | Optional | AA | **Developer Setting**<br />Allow checks to be taken earlier than 8am
 PIN_SUBMISSION_MAX_ATTEMPTS | Int | 100 | Optional | AA | Not used?
 PIN_UPDATE_MAX_ATTEMPTS | Int | 0 | Optional | FC |  The number of school pin updates to attempt in case of a pin collision (as pins are generated randomly). If set to zero, then the number of attempts is calculated as the total number of permutations available.
 PORT | Int | 3001 | Optional | AA | The port the app will listen on.
 PREPARED_CHECK_EXPIRY_SECONDS | Int | 1800 | Optional | PAPI | Once a pupil logs in a live check the expiry in Redis is set to this value. Default is 1800 seconds (30 minutes).
 PREPARE_CHECK_MESSAGE_BATCH_SIZE | Int | 5 | Optional | AA | Appears to be **unused**.
 PS_REPORT_MAX_FILE_UPLOAD_MB | Int | 104857600 | Optional | AA | Not used?
 PUPIL_APP_URL | String | NULL | Required | AA | The URL of the pupil app - used to generate the QR code on the pin slips
 PUPIL_APP_USE_COMPRESSION | Boolean | true | Optional | AA | Determines whether the pupil app should compress the payload before sending it back.  Leave this as true.
 PUPIL_CENSUS_MAX_FILE_UPLOAD_MB | Int | 104857600 | Optional | AA | Not used?
 REDIS_HOST | String | NULL | Required | AA, FC, FC, PAPI | The redis hostname or IP address.
 REDIS_KEY | String | NULL | Optional | AA, FC, FT, PAPI | The redis secret key to use to connect to a password enabled Redis server.
 REDIS_PORT | Int | 6379 | Optional | AA, FC, FT, PAPI | The redis port to connect to.
 REDIS_RESULTS_EXPIRY_IN_SECONDS | Int | 15778800 | Optional | FC | The TTL of the school results object in Redis.Default is six months.
 RETRY_MAX_ATTEMPTS | Int | 3 | Optional | FC, FT,AA | The number of retry attempts to make is the SQL Server is unavailable due to resource constraints.
 RETRY_PAUSE_MS | Int | 5000 | Optional | AA, FC, FT | The number of milliseconds to pause because making the first retry attempt to the Database.  FC and FT default to 5 seconds.
 RETRY_PAUSE_MULTIPLIER | Float | 1.5 | Optional| AA, FC, FT | The multipland to multiply the RETRY_PAUSE_MS number by for successive retry attempts after the first one.  So using the defaults provided: the initial query will have 0 ms delay, then 5000 ms delay, then 7,500 ms delay then 11,250 for FC and FT.
 RUNTIME_EXTERNAL_HOST |  |  |  |  | Custom authentication
 SAS_TIMEOUT_HOURS | Int | 25 | Optional | AA | The default expiry time for the token used to submit the pupil payload.
 SCHOOL_PIN_FUNCTION_ENABLED | Boolean | false | Optional | FC | Used by the Developer Test tools
 SCHOOL_PIN_GEN_FUNCTION_URL | String | http://localhost:7071/api/school-pin-http-service | Optional | AA | The URL of the school pin http service.
 SCHOOL_PIN_SAMPLER_FUNCTION_ENABLED | Boolean | false | Optional | FC | Used by the Developer Test tools
 SCHOOL_RESULTS_CACHE | Int | 1 | Optional | FC | Used by the school results cache determiner.  Set to 0 to never cache, 1 to cache if the date is between the end of the check and the first Monday after the check has ended, or 2 to never cache.
 SCHOOL_RESULTS_CACHE_BATCHS_PER_EXEC | Int | 10 |  Optional | FC | Tune the number of batches of messages the school-results-cache service fetches per invocation.  The  service is run regularly from a timer trigger.
 SCHOOL_RESULTS_CACHE_MSGS_PER_BATCH | Int | 32 | Optional | FC | Tune the number of messages the school-results-cache service fetches per query.
 SESSION_SECRET | String |  | Required | AA | A secret comprised of random characters used to sign session cookies.
 SQL_ALLOW_REPLICA_FOR_READS | Bool | false | Optional | AA | Experimental setting
 SQL_APP_NAME | String | Various | Suggested | AA, FC, FT | Used to provide the app name to SQL Server
 SQL_APP_USER | String |  | Required | AA | Username to use when connecting to the database from the admin app.
 SQL_APP_USER_PASSWORD | String |  | Required | AA | The
 SQL_CENSUS_REQUEST_TIMEOUT | Int | 60000 * 120 | Optional | FC | The timeout in milliseconds for a single request to the database.  This is used purely by the pupil census upload.  Value in milliseconds.
 SQL_CONNECTION_TIMEOUT | Int | 60000 | Optional| AA,FC, FT | The timeout value in milliseconds to allow when opening a connection to the database. Default is 1 minute in ms for FT and FC.
 SQL_CONNECT_TIMEOUT | Int | 30000 | Optional | AA | The timeout value in milliseconds for the SQL connection.
 SQL_DATABASE | String | mtc | Required | AA, FC, FT | Database name to connect to
 SQL_ENABLE_ARITH_ABORT | Boolean | true | Optional | AA, FC, FT | [Used by the TDS library](https://tediousjs. github.io/tedious/api-connection.html)
 SQL_ENCRYPT | Boolean | true | Optional | AA, FC, FT | Whether to use TLS encryption when connecting to the Database.  Azure SQL Server requires `true`.  Can be set to false for local development only.
 SQL_FUNCTIONS_APP_USER | String | NULL | Required | FC, FT | SQL user name
 SQL_FUNCTIONS_APP_USER_PASSWORD | String | NULL | Required | FC, FT | SQL user password
 SQL_POOL_ACQUIRE_TIMEOUT | Int | 30000 | Optional | AA | Not used?
 SQL_POOL_LOG_ENABLED | Boolean | Various | Optional | AA, FC, FT |
 SQL_POOL_MAX_COUNT | Int | Various | Optional | AA, FC, FT | Maximum number of connections to keep open in the SQL connection pool. FT and FC default to 10.
 SQL_POOL_MIN_COUNT | Int | Various | Optional | AA, FC, FT | Minimum number of connections to keep open in the SQL connection pool.  FT and FC default to 5.
 SQL_PORT | Int | 1433 | Required | AA, FC, FT | Port the SQL Server is open on
 SQL_PUPIL_CENSUS_USER | String | NULL | Required | FC | SQL user to import the pupil census.
 SQL_PUPIL_CENSUS_USER_PASSWORD | String | NULL | Required | FC | SQL user password for the pupil census user.
 SQL_REQUEST_TIMEOUT | Int | 60000 | Optional | AA, FC, FT | Request timeout in milliseconds for requests made to the database.
 SQL_SERVER | String | localhost | Required | AA, FC, FT | SQL Server hostname or IP address
 SQL_TECH_SUPPORT_USER | String | N/A | Required | AA | Experimental setting.  The username to use when connecting to the SQL DB as this user.
 SQL_TECH_SUPPORT_USER_PASSWORD | String | N/A | Required | AA | Experimental setting.  The password to use when connecting to the SQL DB as this user.
 SQL_TRUST_SERVER_CERTIFICATE | Bool | true | Optional | AA | Used when establising a TLS connection to MSSQL Server.[See the docs.](https://docs.microsoft.com/en-us/sql/connect/jdbc/connecting-with-ssl-encryption?view=sql-server-ver15)
 SUBMIT_CHECK_FUNCTION_ENABLED | Boolean | false | Optional | FC | Used by the Developer Test tools
 SYNC_RESULTS_INIT_MAX_PARALLEL_TASKS | Int | 5 | Optional | FT | Configure the number of parallel tasks when running the sync-results-init function.
 TECH_SUPPORT_SQL_POOL_MIN_COUNT | Int | 0 | Optional | AA | Experimental setting.  The minimum number of sql connections to hold in the tech-support sql connection pool.
 TECH_SUPPORT_SQL_POOL_MIN_COUNT | Int | 2 | Optional | AA | Experimental setting.  The maximum number of sql connections to hold in the tech-support sql connection pool.
 WAIT_TIME_BEFORE_EXIT | Int | 30 | Optional | AA | The amount of time to wait, in seconds, before exiting in the event that the app is unable to initialise a connection to the database.
 WAIT_TIME_BEFORE_REDIRECT | Int | 2 | Optional | AA | The amount of time to wait, in seconds, when using the redirect-delay pattern, before redirecting the user to the final resource.
 WEBSITE_OFFLINE | Boolean | false | Optional | AA | Set to true to disable all routes in the app, replacing them with 'Service Unavailable' page
