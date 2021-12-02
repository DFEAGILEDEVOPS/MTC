FROM node:12.18.2

RUN mkdir -p /usr/src/app
WORKDIR /user/src/app
# copying just the package.json and lock file ensures this layer will only be rebuilt when
# changes to package.json have been made
COPY package.json .
COPY yarn.lock .
RUN yarn install --ignore-engines --frozen-lockfile

COPY . .

# this container will run migrations once port 1433 on the db server is open
# when the migrations are complete, it will exit
CMD ./run-dev-migrations.sh
