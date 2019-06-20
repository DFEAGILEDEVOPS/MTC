[![Build Status](https://travis-ci.org/DFEAGILEDEVOPS/MTC.svg?branch=master)](https://travis-ci.org/DFEAGILEDEVOPS/MTC)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9f1ef3308c8c407284322926f501d537)](https://www.codacy.com/app/js_4/MTC?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=DFEAGILEDEVOPS/MTC&amp;utm_campaign=Badge_Grade)
[![CircleCI](https://circleci.com/gh/DFEAGILEDEVOPS/MTC.svg?style=svg)](https://circleci.com/gh/DFEAGILEDEVOPS/MTC)

# Multiplication Tables Check (MTC) Project

## Project tooling requirements

- Docker (current LTS)
- Node JS (best installed via nvm)
- Text Editor
- bash
- Azure storage explorer
- An azure storage account

## Quickstart

Ensure you have set the `AZURE_STORAGE_CONNECTION_STRING` value to your azure storage account.
From the repository root (this directory) run `./start.sh`.  This will create the necessary storage queues, storage tables and stand up a docker instance of SQL Server Linux and run all the migrations to create the MTC database.

You can now start the admin, pupil-spa & pupil-api applications individually.

## Docker Compose

There are 3 docker files...

### docker-compose.yml
The default, which runs just SQL Server (main data store) and MongoDB (express session store)
Stand up the database containers with: `docker-compose up`

### docker-compose.admin-test.yml and docker-compose.pupil-test.yml
Runs SQL Server, MongoDB, all web applications, and the pupil and admin test suites as separate containers.
This compose file depends on `docker-compose.yml` and should not be run directly.

To stand up the tests, app and db containers run either `./run-compose-admin-test-suite.sh` or `./run-compose-pupil-test-suite.sh`

Both of these scripts require the following values defined in `/admin/.env`:
```
AZURE_STORAGE_CONNECTION_STRING='foo-bar'
SQL_PUPIL_CENSUS_USER_PASSWORD='foo-bar'
```

### run-compose-admin-test-suite.sh
In order to run the admin test containers to completion, and exit with a non-zero exit code during CI, execute the `run-compose-admin-test-suite.sh` bash script, which will monitor the compose containers for non-zero exit codes (typically generated by the test suites when they fail), tear down all containers and exit appropriately.

### run-compose-pupil-test-suite.sh
In order to run the pupil test containers to completion, and exit with a non-zero exit code during CI, execute the `run-compose-pupil-test-suite.sh` bash script, which will monitor the compose containers for non-zero exit codes (typically generated by the test suites when they fail), tear down all containers and exit appropriately.


Once the full compose stack is up and running, you can browse to....

* http://localhost:3001 (Admin App)
* http://localhost:80 (Pupil App)

The MTC solution consists of the following projects...

- Pupil Check Application (`/pupil-spa/`) Angular SPA
- Check Administration Application (`/admin/`) Express MVC application
- Pupil Auth API (`/pupil-api/`) Typescript Express API Application

See each projects readme for app specifics.

### Building Docker Images

to build an individual docker image, navigate to the relevant app folder and run...

`docker build -t <image name> .`

where `<image-name>` is a friendly name that allows you to easily identify the image.

[Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

### Using microservices

To make the pupil-spa use the auth microservice instead of the API in admin, change the AUTH_URL environment variable in `pupil-spa/Dockerfile` and the `docker-compose.*.yml` files relevant for pupil-spa

### SQL Connectivity

See the following docs for info on sql connection and pooling behaviour...
- https://tediousjs.github.io/node-mssql/#connection-pools
- https://github.com/vincit/tarn.js/#usage
