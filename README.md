[![Build Status](https://travis-ci.org/DFEAGILEDEVOPS/MTC.svg?branch=master)](https://travis-ci.org/DFEAGILEDEVOPS/MTC)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9f1ef3308c8c407284322926f501d537)](https://www.codacy.com/app/js_4/MTC?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=DFEAGILEDEVOPS/MTC&amp;utm_campaign=Badge_Grade)

# Multiplication Tables Check (MTC) Project

Requires Docker 17.05 or later.
Run `docker-compose up` from repository root.

Browse to....

* http://localhost:3000 (Legacy Pupil Check)
* http://localhost:3001 (Admin App)
* http://localhost:3002 (New Pupil App)

The MTC solution consists of the following projects...

- Legacy Pupil Check Application (`/pupil/`) Express MVC application, soon to be retired
- Pupil Check Application (`/pupil-spa/`) Angular SPA
- Check Administration Application (`/admin/`) Express MVC application
- Electron Container for Pupil Check Application (`/electron/`) Electron shell for Pupil Check Application

See each projects readme for app specifics.

## Docker setup

Each application has a dockerfile.  The [compose file in the repository root](docker-compose.yml) contains configuration to setup a local development environment, which includes the following nodes...

Pupil SPA (Nginx alpine container)
Legacy Pupil MVC App (Node container)
Admin MVC App (Node container)
Database (MongoDB container)
ESB (RabbitMQ container) (Currently disabled until required)

Simply run `docker-compose up` from the root directory to start the environment.  See 1st paragraph above for URL info.


[Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
