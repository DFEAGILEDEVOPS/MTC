FROM node:10.16.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn install --ignore-engines --frozen-lockfile
# RUN ./node_modules/.bin/gulp build
RUN yarn global add pm2

EXPOSE 3001

RUN chmod +x wait-sqldb.sh

CMD ./wait-sqldb.sh && ./docker-start.sh
