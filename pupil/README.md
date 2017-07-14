# Multiplication Tables Check (MTC)

MTC tests the students ability to recall the 1 - 12 times tables.

## Screenshots (if there's a client-facing aspect of it)

ToDo

## Live examples (if available)

N/A

## Nomenclature

- **MTC**: Multiplication Tables Check - it's a check and not a test
- **STA**: Standards and Testing Agency - an executive agency of the Department for Education
- **form**: the multiplication questions

## Technical documentation

This is a node / express server and Javascript on the client. 

### Dependencies

You need to have node and npm installed.

- [node](https://nodejs.org/) - Node javascript runtime 
- [mongo](https://www.mongodb.com/) - NoSQL datastore

You can then install all required dependencies by running:

`npm install`

The server will need write access to the public/stylesheets/ folder to write the compiled css.

See the [package.json](./package.json) file for the full list of npm dependencies.

#### Installing Mongo

Use the docker official image:

```bash
docker run --name mongo -d  -p 27017:27017 mongo
```

See the [GDS toolkit pages](https://www.gov.uk/service-manual/design/using-the-govuk-template-frontend-toolkit-and-elements)

### Running the application

Simple: `npm start`

Complex: `DEBUG=mtc-app* PORT=3000 NODE_ENV=development npm start`

Both will launch the app in development mode on http://localhost:3000/

#### Environment Variables

To submit the feedback form the credentials for a Google Service Account that has write access to the Google 
Sheet must be set in the environment:

* GOOGLE_SVC_EMAIL - the email address of the service account (if feedback is going to Google Sheets)
* GOOGLE_SVC_PK - the private key of the service account (if feedback is going to Google Sheets)
* GOOGLE_SVC_DOC_KEY - the document ID for the spreadsheet to send the feedback to ((if feedback is going to Google Sheets)
* GOOGLE_TRACKING_ID - Google Analytics Tracking code, e.g 'UA-1234567-1'.  Google tracking is only enabled if there is
  a tracking code and in production mode, eg `NODE_ENV=production`
* SESSION_SECRET - secret key to sign the cookie with HMAC (prod only as dev has a fallback)
* MONGO_CONNECTION_STRING - defaults to `mongodb://localhost/mtc`

### Sites and Google Tracking codes

| Site                  | Purpose        | Branch | Google Tracking Code |
| --------------------- | :------------- | ------ | -------------------- |
| itc.stamtc.uk         | ITC School Survey     | `support/itc-survey`   | UA-92976848-1 |
| 4pin.stamtc.uk        | Usability study - 4 PIN auth option | `master` | UA-92976848-4 |
| 5pin.stamtc.uk        | Usability study - 5 PIN auth option | `master` | UA-92976848-5 |

Note that 4pin is not used any longer.

### Running the test suite

`npm test`

### Running database migrations

You will need a local mongo datastore.

This project uses [migrate-mongo] (https://www.npmjs.com/package/migrate-mongo) to run the database migrations.  To 
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

`"watch-jscss": "gulp watch"`

On the console:

`npm-run-all --parallel watch-jscss startn`

## Licence

UNLICENCED - for STA use only
