#!/usr/bin/env bash
set -x
CWD=$(pwd)

# deploy admin
ADMIN_APP="${CWD}/admin"
TEMP_DIR=$(mktemp -d)
cd ${TEMP_DIR}
cp -a "${ADMIN_APP}" .
cd admin
rm -rf node_modules package-lock.json
git init
git add -A
git commit -q -m 'deploying admin'
heroku git:remote -a check-development
git push -f heroku master
cd ${CWD}
rm -rf ${TEMP_DIR}

# deploy pupil
APP="${CWD}/pupil"
TEMP_DIR=$(mktemp -d)
cd ${TEMP_DIR}
cp -a "${APP}" .
cd pupil
rm -rf node_modules package-lock.json
git init
git add -A
git commit -q -m 'deploying pupil'
heroku git:remote -a mtc-demo
git push -f heroku master
cd ${CWD}
rm -rf ${TEMP_DIR}
