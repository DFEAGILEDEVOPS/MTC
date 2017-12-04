# Multiplication Tables Check Development App (MTC)

Administer the Multiplication Table Check

## Nomenclature

- **MTC**: Multiplication Tables Check - it's a check and not a test
- **STA**: Standards and Testing Agency - an executive agency of the Department for Education
- **check form**: the multiplication questions

## Technical documentation

This is a node / express server and Javascript on the client. 

### Dependencies

You need to have node installed and access to an instance of SQL Server and MongoDB.  MongoDB is being phased out, and SQL Server phased in.

- [node](https://nodejs.org/) - Node javascript runtime 
- [mongo](https://www.mongodb.com/) - NoSQL datastore
- [SQL Server](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker) - Relational datastore

Installation notes for SQL Server & MongoDB are documented below.

#### Packages

You _can_ use npm to install application packages, but we prefer [yarn](https://yarnpkg.com/lang/en/)
You can then install all required dependencies by running:

`yarn install`

The server will need write access to the public/stylesheets/ folder to write the compiled css.

See the [package.json](./package.json) file for the full list of npm dependencies.

#### Installing Mongo

Use the docker official image:

```bash
docker run --name mongo -d  -p 27017:27017 mongo
```

#### Installing SQL Server

Use the [official docker image](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker), or provision a SQL Azure instance.

### Running the application

Simple: `yarn start`

Complex: `DEBUG=mtc-app* PORT=3001 NODE_ENV=development yarn start`

Both will launch the app in development mode on http://localhost:3001/

#### Environment Variables

dotenv is installed and will load environment variables from a `.env` file stored in the root of the admin application, if you have created one.  See [documentation](https://www.npmjs.com/package/dotenv) for more info.

* MONGO_CONNECTION_STRING - defaults to `mongodb://localhost/mtc`
* AZURE_STORAGE_CONNECTION_STRING - Blob storage account for upload file storage.  Upload only happens for production 
  envs, but the connection string is required for all.
* SESSION_SECRET - random string; required for session support
* TSO_AUTH_PUBLIC_KEY - Third party Public RSA key in PEM format used during Authorisation
* MTC_AUTH_PRIVATE_KEY - The MTC Private RSA key in PEM format used during Authorisation
* NCA_TOOLS_AUTH_URL - Trigger redirection to this URL on sign-in if not authenticated
* GOOGLE_TRACKING_ID - Google Analytics Tracking code, e.g 'UA-1234567-1'.  Google tracking is only enabled if there is
  a tracking code and in production mode, eg `NODE_ENV=production`

SQL Server specific environment variables
* SQL_POOL_MIN_COUNT - the minimum number of connections in the pool
* SQL_POOL_MAX_COUNT - the maximum number of connections in the pool
* SQL_APP_NAME - the name of the application added to log traces.  very useful for debugging
* SQL_USER - the username for the credentials
* SQL_PASSWORD - the password for the credentials
* SQL_SERVER - the server to connect to
* SQL_DATABASE - the database to connect to

#### Using SQL Server

We use [tedious](http://tediousjs.github.io/tedious/) package for SQL Server data operations.  This has been abstracted with a connection pool implementation and methods for querying and modifying data have been surfaced via the [sqlService](./services/data-access/sql.service.js) object.  

Example usage can be found [here](./sql.usage.example.js)

### Running the test suite

`yarn test`

### Running database migrations

You will need a local mongo datastore.  SQL Server migrations are yet to be added at this stage.

This project uses [migrate-mongo](https://www.npmjs.com/package/migrate-mongo) to run the database migrations.  To 
ensure your local mongo database is up-to-date:

```bash
cd data/migrations
../../node_modules/.bin/migrate-mongo up
```

You can also perform a downward migration:

```bash
../../node_modules/.bin/migrate-mongo down
```

## Create a new migration

```bash
cd data/migrations
 ../../node_modules/.bin/migrate-mongo create 'my new feature'
```
You can then edit the skeleton file created with the required `up` and `down` migrations. 


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
