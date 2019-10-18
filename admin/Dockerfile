FROM node:10.16.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY ./assets /usr/src/app/assets
COPY ./gulpfile.js /usr/src/app
COPY ./config.js /usr/src/app
COPY ./config/sql.config.js /usr/src/app/config/
# auth-modes.js added as it is a dependency of `config.js`
COPY ./lib/consts/auth-modes.js /usr/src/app/lib/consts/
RUN yarn install --ignore-engines --frozen-lockfile

COPY . .
RUN ./node_modules/.bin/gulp build
RUN yarn global add pm2

EXPOSE 3001

RUN chmod +x wait-sqldb.sh

CMD ./wait-sqldb.sh && ./docker-start.sh
