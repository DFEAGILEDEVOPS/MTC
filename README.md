[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6524c6996d9240e4b7c9b63960677efe)](https://app.codacy.com/gh/DFEAGILEDEVOPS/MTC/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![CircleCI](https://circleci.com/gh/DFEAGILEDEVOPS/MTC.svg?style=svg)](https://circleci.com/gh/DFEAGILEDEVOPS/MTC)

# Multiplication Tables Check (MTC) Project

## Project tooling requirements

- Docker (current LTS)
- Node JS (best installed via [nvm](https://github.com/nvm-sh/nvm))
- [Azure Functions Core Tools CLI](https://github.com/Azure/azure-functions-core-tools)
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

### docker-compose-apps.yml
Stands up the pupil-api, pupil-spa, admin app, functions-app, func-consumption app, and automatically runs the db migrations

Start: `docker-compose -f docker-compose.yml -f docker-compose-apps.yml up`
Teardown: `docker-compose -f docker-compose.yml -f docker-compose-apps.yml down`

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
