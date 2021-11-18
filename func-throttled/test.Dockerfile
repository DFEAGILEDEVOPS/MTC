# WARNING
# func consumption relies on the dist output from tslib
# this must be built before building this dockerfile
FROM stamtc/mtc-azure-functions-base:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
# TODO because we use dist, the reference to tslib tsconfig.json is broken
COPY dist .
CMD yarn start
