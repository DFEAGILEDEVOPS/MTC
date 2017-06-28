FROM node:latest
MAINTAINER Jon Shipley <js@ovix.co.uk>
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN ./node_modules/.bin/gulp build
EXPOSE 3000
CMD [ "npm", "start" ]


