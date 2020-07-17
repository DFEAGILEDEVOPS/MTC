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
- An Azure storage account
- An Azure service bus account

## Quickstart

Ensure you have set the `AZURE_STORAGE_CONNECTION_STRING` value to your azure storage account.
From the repository root (this directory) run `./start.sh`.  This will create the necessary storage queues, storage tables and stand up a docker instance of SQL Server Linux and run all the migrations to create the MTC database.

You can now start the admin, pupil-spa & pupil-api applications individually.

## Docker Compose

There are 2 docker-compose files...

### docker-compose.yml
The default, which runs just SQL Server (main data store) and Redis (express session store)
Stand up the database containers with: `docker-compose up`

### docker-compose-other-dev.yml
Stands up the pupil-api, pupil-spa, admin app, functions-app, func-consumption app, and automatically runs the db migrations

Start: `docker-compose -f docker-compose.yml -f docker-compose-other-dev.yml up`
Teardown: `docker-compose -f docker-compose.yml -f docker-compose-other-dev.yml down`

## Solution

Once the full compose stack is up and running, you can browse to....

* http://localhost:3001 (Admin App)
* http://localhost:4200 (Pupil App)

### Other services
* http://localhost:3003 (API)
* http://localhost:7071 (Azure consumption plan functions)
* http://localhost:7072 (Azure app service plan functions)
* Azure storage account tables, queues, blob containers
* Azure service bus

The MTC solution consists of the following projects...

- Pupil Check Application (`/pupil-spa/`) Angular SPA
- Check Administration Application (`/admin/`) Express MVC application
- Pupil Auth API (`/pupil-api/`) Typescript Express API Application
- Consumption functions (`/func-consumption/`) Azure functions run on a consumption plan
- App service functions (`/functions-app/`) long-running Azure functions to be run on an Azure app-service plan

See each projects readme for app specifics.

### Building Docker Images

to build an individual docker image, navigate to the relevant app folder and run...

`docker build -t <image name> .`

where `<image-name>` is a friendly name that allows you to easily identify the image.

[Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

### SQL Connectivity

See the following docs for info on sql connection and pooling behaviour...
- https://tediousjs.github.io/node-mssql/#connection-pools
- https://github.com/vincit/tarn.js/#usage
