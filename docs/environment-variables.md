# Environment variables used in the MTC solution

## Components shorthand

* **FT** - functions throttled 
* **FC** - functions consumption
* **AA** - admin app
* **PA** - pupil app (SPA)
* **PAPI** - pupil API 

Env Var | Type | Default value | Required? | Components | Description 
--- | --- | --- | --- | --- | ---
CHECK_COMPLETION_QUEUE_MAX_DELIVERY_COUNT | Int | 10 | Optional | FT | Taken from the `check-completion` Azure service bus queue: maxDeliveryCount
DEBUG_VERBOSITY | Int | 1 | Optional | FT, FC, AA | Set to 0 for now additional logging, 1 for more verbosity, and 2 to see SQL queries (requires the LOGLEVEL set to debug)

