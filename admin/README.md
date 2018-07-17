# Multiplication Tables Check Development App (MTC)

Administer the Multiplication Table Check

## Nomenclature

- **MTC**: Multiplication Tables Check - it's a check and not a test
- **STA**: Standards and Testing Agency - an executive agency of the Department for Education
- **check form**: the multiplication questions

## Technical documentation

This is a node / express server and Javascript on the client. 

Simple developer steps:
* `yarn install`
* `docker-compose up`
* `yarn startd`

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

dotenv is installed and will load environment variables from a `.env` file stored in the root of the admin application, 
if you have created one.  See [documentation](https://www.npmjs.com/package/dotenv) for more info.

* AUTO_MARK - boolean - defaults to `true` to automatically mark the checks when they are submitted, to override 
  this:`AUTO_MARK=false yarn start`
* AZURE_STORAGE_CONNECTION_STRING - Blob storage account for upload file storage.  Upload only happens for production 
    envs, but the connection string is required for all.
* GOOGLE_TRACKING_ID - Google Analytics Tracking code, e.g 'UA-1234567-1'.  Google tracking is only enabled if there 
    is a tracking code and in production mode, eg `NODE_ENV=production`
* MTC_AUTH_PRIVATE_KEY - The MTC Private RSA key in PEM format used during Authorisation
* NCA_TOOLS_AUTH_URL - Trigger redirection to this URL on sign-in if not authenticated
* RESTART_MAX_ATTEMPTS - Total number of allowed check retakes per pupil
* SESSION_SECRET - random string; required for session support
* TSO_AUTH_PUBLIC_KEY - Third party Public RSA key in PEM format used during Authorisation

SQL Server specific environment variables
* SQL_POOL_MIN_COUNT - the minimum number of connections in the pool
* SQL_POOL_MAX_COUNT - the maximum number of connections in the pool
* SQL_POOL_LOG_ENABLED - enables console logging of connection pool activity
* SQL_APP_NAME - the name of the application added to log traces.  very useful for debugging
* SQL_APP_USER - the username that the application connects as (should be a database level user _only_)
* SQL_APP_USER_PASSWORD - password for the SQL_APP_USER
* SQL_ADMIN_USER - the server level user account used to perform database migrations.
* SQL_ADMIN_USER_PASSWORD - password for the SQL_ADMIN_USER_PASSWORD.
* SQL_SERVER - the server to connect to
* SQL_DATABASE - the database to connect to
* SQL_PORT - the port to connect on, defaults to 1433
* SQL_TIMEOUT - the time in milliseconds before an operation times out
* SQL_AZURE_SCALE - the azure specific scale setting for the database.  Such as S1, S2, S3 etc.  When this is left blank, migrations are assumed to be running in a docker instance of SQL Server

`config.js` contains defaults for a local sql server instance with matching credentials for the docker compose instance.

#### Using SQL Server

We use [tedious](http://tediousjs.github.io/tedious/) package for SQL Server data operations.  This has been abstracted with a connection pool implementation and methods for querying and modifying data have been surfaced via the [sqlService](./services/data-access/sql.service.js) object.  

Example usage can be found [here](./sql.usage.example.js)

### Running the test suite

`yarn test`

### Running SQL Server migrations

We use postgrator to run database migrations. 

`yarn migrate-sql` to migrate to the latest or `yarn migrate-sql 123` to migrate to a particular version

## Live reloading on change

In devDependencies, make sure you have npm-run-all:

`"npm-run-all": "^4.0.2",`

`"nodemon": "^1.11.0",`

If not, install them.

In scripts, have the following:

`"startn": "nodemon ./server.js",`

`"sasswatch": "gulp watch"`

On the console:

`npm-run-all --parallel sasswatch startn`

## Docker Compose

The compose file in the root allows you to spin up a working environment with one command...

`docker-compose up`

after making changes ensure you do `docker-compose build` to rebuild from source.
