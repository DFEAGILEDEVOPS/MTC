FROM node:8.4.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN yarn install --ignore-engines

COPY . .
RUN yarn global add pm2

EXPOSE 3002
CMD ["./docker-start.sh" ]
