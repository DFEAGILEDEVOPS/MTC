FROM mtc-functions-base:latest
RUN mkdir -p /mtc/functions-app
WORKDIR /mtc/functions-app
RUN func extensions install
CMD ["../wait-for-it.sh",  "sqldb:1433", "-t", "120", "--", "yarn",  "start"]
