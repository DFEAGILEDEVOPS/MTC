FROM node:8.4.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY ./index.js /usr/src/app
RUN yarn install --ignore-engines

COPY . .

EXPOSE 3000
CMD ["node", "./index.js" ]
