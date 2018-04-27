### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:8-alpine as builder

COPY package.json .
COPY yarn.lock .
COPY /tools /tools/

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN yarn install --ignore-engines && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

RUN yarn run postinstall
RUN yarn run sass
ARG api_url=http://localhost:3001
ARG auth_url=http://localhost:3001/api/questions
# ARG auth_url=http://localhost:3003/auth
ENV API_URL=$api_url
ENV AUTH_URL=$auth_url
ARG ga_code
ENV GA_CODE=$ga_code
RUN $(npm bin)/gulp setApiURL
RUN $(npm bin)/gulp setAuthURL
RUN $(npm bin)/gulp setGaCode

## Build the angular app in production mode and store the artifacts in dist folder
RUN yarn remove @angular/cli
RUN yarn add @angular/cli
RUN $(npm bin)/ng build --prod

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

## Revove the 'assets' folder that got copied
# Can't yet: `assets` is referenced in 2 places:
#  * header.component.ts:13
#  * app.component.ts:9
#RUN rm -rf /usr/share/nginx/html/assets

CMD ["nginx", "-g", "daemon off;"]
