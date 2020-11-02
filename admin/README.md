# Multiplication Tables Check Development App (MTC)

Administer the Multiplication Table Check

## Nomenclature

- **MTC**: Multiplication Tables Check - it's a check and not a test
- **STA**: Standards and Testing Agency - an executive agency of the Department for Education
- **check form**: the multiplication questions

## Technical documentation

This is a node / express server and Javascript on the client.

Simple developer steps:
* start the docker container for mssql
    - `./start.sh` or `./restart.sh`
* install the npm packages and run the `admin`
    - `cd admin`
    - `yarn install`
    - `yarn start`

The app will now be available on `http://localhost:3001`

### Dependencies

You need to have node installed and access to an instance of SQL Server.

- [node](https://nodejs.org/) - Node javascript runtime
- [SQL Server](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker) - Relational datastore
- [NPM packages](https://www.npmjs.org) installed globally (for developers): `yarn`
- [Docker](https://www.docker.com/get-docker) - Docker to run containers

We recommend developers manage their `node` and `npm` packages using [nvm](http://nvm.sh)

#### Packages

You _can_ use npm to install application packages, but we prefer [yarn](https://yarnpkg.com/lang/en/)
You can then install all required dependencies by running:

`yarn install`

The server will need write access to the public/stylesheets/ folder to write the compiled css.

See the [package.json](./package.json) file for the full list of npm dependencies.


#### Installing SQL Server

Use the [official docker image](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker), or provision a SQL Azure instance.

`docker-compose up` will bring up the official docker image

### Running the application

Simple: `yarn start`

Complex: `DEBUG=mtc-app* PORT=3001 NODE_ENV=development yarn start`

Developer: `yarn startd` will run the sql migrations and then start the app

Both will launch the app in development mode on http://localhost:3001/

#### Environment Variables

dotenv is installed and will load environment variables from a `.env` file stored in the root of the project,
if you have created one.  See [documentation](https://www.npmjs.com/package/dotenv) for more info.

##### Required environment variables

The solution will fail to operate correctly without the following environment variables configured...

* `SQL_TECH_SUPPORT_USER_PASSWORD` - **Required** password for the tech support sql azure user.  automatically created via sql migration
* `SQL_PUPIL_CENSUS_USER_PASSWORD` - **Required** password for the pupil census sql azure user.  automatically created via sql migration
* `AZURE_STORAGE_CONNECTION_STRING` - **Required**  Azure Storage account connection string.  Upload is only enabled for
    production environments, but the queues are used by all environments

##### Optional environment variables

* DEBUG_VERBOSITY - For even more logging when the log level is set to `debug`.  Set to 1 for default logging, 2 for
    more logging, and 3 for even more
* LOG_LEVEL - set to one of `debug`, `info`, `warning`, `error`, `alert`.  Default is `info`
* GOOGLE_TRACKING_ID - Google Analytics Tracking code, e.g 'UA-1234567-1'.  Google tracking is only enabled if there
    is a tracking code and in production mode, eg `NODE_ENV=production`
* RESTART_MAX_ATTEMPTS - Total number of allowed check retakes per pupil
* SESSION_SECRET - random string; required for session support
* SAS_TIMEOUT_HOURS - number - the timeout in hours of the SAS token used to submit the completed check to the client
* AZURE_QUEUE_PREFIX - string - a prefix used to construct environment-specific queue names: e.g. `prefix` or `some-prefix`
* AZURE_TABLE_PREFIX - string - a prefix used to construct environment-specific table names: e.g. `prefix` or `somPrefix`
* DEFAULT_ADMIN_PASSWORDHASH - string - a bcrypt password hash which will be used to overwrite all the `[mtc_admin].[user].[passwordHash]` values when running seeds (`node data/sql/seed-sql.js`)
* WEBSITE_OFFLINE - boolean - disables the admin app and shows a downtime message
* FEATURE_TOGGLE_SCHOOL_RESULTS_ALLOW_FETCH_FROM_DB - allow the schools results to be retrieved from the DB if not in Redis

SQL Server specific environment variables
* SQL_ADMIN_USER - the server level user account used to perform database migrations.
* SQL_ADMIN_USER_PASSWORD - password for the SQL_ADMIN_USER_PASSWORD.
* SQL_APP_NAME - the name of the application added to log traces.  very useful for debugging
* SQL_APP_USER - the username that the application connects as (should be a database level user _only_)
* SQL_APP_USER_PASSWORD - password for the SQL_APP_USER
* SQL_AZURE_SCALE - the azure specific scale setting for the database.  Such as S1, S2, S3 etc.  When this is left blank, migrations are assumed to be running in a docker instance of SQL Server
* SQL_DATABASE - the database to connect to
* SQL_ENABLE_ARITH_ABORT - defaults to true. See the [docs](https://tediousjs.github.io/tedious/api-connection.html)
* SQL_ENCRYPT - use encryption to connect to the DB.  Defaults to true.
* SQL_POOL_LOG_ENABLED - enables console logging of connection pool activity
* SQL_POOL_MAX_COUNT - the maximum number of connections in the pool
* SQL_POOL_MIN_COUNT - the minimum number of connections in the pool
* SQL_PORT - the port to connect on, defaults to 1433
* SQL_SERVER - the server to connect to
* SQL_TIMEOUT - the time in milliseconds before an operation times out
* SQL_TRUST_SERVER_CERTIFICATE - if false tedious will verify the server SSL cert.  Defaults to false. See the [docs](https://tediousjs.github.io/tedious/api-connection.html)


`config.js` contains defaults for a local sql server instance with matching credentials for the docker compose instance.

#### Using SQL Server

We use [tedious](http://tediousjs.github.io/tedious/) package for SQL Server data operations.  This has been abstracted with a connection pool implementation and methods for querying and modifying data have been surfaced via the [sqlService](./services/data-access/sql.service.js) object.

### Running the test suite

`yarn test`

### Running SQL Server migrations

We use postgrator to run database migrations under a dedicated app in the `db` folder.  See [the readme](../db) for full details.

### Parse school changes from CSV

```
yarn parse-school-changes-csv PATH_TO_CSV
```
e.g.
```
yarn parse-school-changes-csv /Users/jane/Downloads/03\ Weekly\ updates/MIgrations_20190404.csv
```

## Live reloading on change

In devDependencies, make sure you have npm-run-all:

`"npm-run-all": "^4.0.2",`

If not, install them.

In scripts, have the following:

`"sasswatch": "gulp watch"`

On the console:

`npm-run-all --parallel sasswatch`

## Docker Compose

The compose file in the root allows you to spin up a working environment with one command...

`docker-compose up`

after making changes ensure you do `docker-compose build` to rebuild from source.

## Redis Caching

`sqlService.query` can now take an optional third argument which is a Redis key in the format `dataServiceName.methodName`. The result-set from this query will be saved in Redis against the supplied key.

In any service methods which updates tables which will affect these caches, `redisCacheService.drop('cacheName')` can be used to drop it for re-querying. It accepts a single string or an array of strings.

Updates to an existing Redis cache can be done with `redisCacheService.update`. It will perform the supplied changes object on the Redis cache and then send it (with the affected table name) to the Azure `sql-update` message queue. Where it will then be consumed and applied in SQ server by a listener in `/functions`.

## Error Information

When triggering an error, you can specify a dedicated error type that includes the actual error message as an argument.

These error types will need to extend from `mtcBaseError`. For example:
```
checkWindowV2Service.getCheckWindow = async (urlSlug) => {
  if (!urlSlug || !validate(urlSlug)) {
    throw new MtcCheckWindowNotFoundError('Check window url slug is not valid')
  }
  return checkWindowDataService.sqlFindOneByUrlSlug(urlSlug)
}
```
