### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:8-alpine as builder

COPY package.json .

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

RUN npm run postinstall
ARG api_url=http://localhost:3001
ENV API_URL=$api_url
RUN $(npm bin)/gulp setAppEnvironmentVariables

## Build the angular app in production mode and store the artifacts in dist folder
RUN $(npm bin)/ng build --prod
#RUN $(npm bin)/ng build

### STAGE 2: Setup ###

FROM nginx:1.13.3-alpine

# defer until SSL integrated, need to get package
# RUN openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
