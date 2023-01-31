FROM node:8.11.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app/ /usr/src/app
RUN yarn install --ignore-engines --frozen-lockfile --production
CMD ["yarn",  "start"]
