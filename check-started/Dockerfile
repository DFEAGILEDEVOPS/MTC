FROM node:8

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN yarn install --ignore-engines

COPY . .
RUN yarn global add pm2

EXPOSE 3004
CMD ["./docker-start.sh" ]
