FROM node:12.18.2
RUN mkdir -p /mtc/db
WORKDIR /mtc/db
CMD ./run-dev-migrations.sh
