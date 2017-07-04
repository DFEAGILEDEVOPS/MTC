[![Build Status](https://travis-ci.org/DFEAGILEDEVOPS/MTC.svg?branch=master)](https://travis-ci.org/DFEAGILEDEVOPS/MTC)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9f1ef3308c8c407284322926f501d537)](https://www.codacy.com/app/js_4/MTC?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=DFEAGILEDEVOPS/MTC&amp;utm_campaign=Badge_Grade)]

# Multiplication Tables Check (MTC) Project

The MTC solution consists of 3 core projects...

- Pupil Check Application (`/pupil/`)
- Check Administration Application (`/admin/`)
- Electron Container for Pupil Check Application (`/electron/`)

See each projects readme for app specifics.

## Build & Release Process

Build and Release is performed from VSO to deployment targets (currently Heroku, and back to Azure in July)

### Builds

Under the VSO builds tab we have 2 jobs which create and publish Docker container images for the Pupil Check & Check Admin applications respectively.

Once these builds complete successfully they trigger the release process.

### Release

Under the VSO releases tab we have 2 jobs which release the newly published container images to the Linux App Service instances in Azure.

**Important** - The releases feature allows you to edit either the main release definition OR a prior release.  If you wish to edit the main release definition you must click the elipsis next to the release definition.  Do not edit a prior release as your changes will only be saved to that specific release instance.  Editing a release instance is only useful when trying different settings without editing the main release.  VSO does not make this very obvious. 

[Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)