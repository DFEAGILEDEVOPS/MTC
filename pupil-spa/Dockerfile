### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:10-alpine as builder

RUN apk update && \
    apk upgrade && \
    apk add git

COPY package.json .
COPY yarn.lock .
COPY /tools /tools/

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN yarn install --frozen-lockfile --ignore-engines && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

RUN yarn run postinstall
RUN yarn run sass
ARG AUTH_URL
ARG runtime_config_url=/public/config.json

## The config will be loaded at runtime from this path / URL, but
# this path needs to be set at build time. It can be an external
# URL too, as long as it's accessible through http

ARG ga_code
ARG APPINSIGHTS_INSTRUMENTATIONKEY
ARG azure_acccount_name
ENV AUTH_URL=$AUTH_URL
ENV GA_CODE=$ga_code
ENV APPINSIGHTS_INSTRUMENTATIONKEY=$APPINSIGHTS_INSTRUMENTATIONKEY
ENV AZURE_ACCOUNT_NAME=$azure_account_name
ENV RUNTIME_CONFIG_URL=$runtime_config_url

RUN $(npm bin)/gulp setRuntimeConfigURL

## Build the angular app in production mode and store the artifacts in dist folder
# RUN $(npm bin)/ng build --prod
RUN yarn build --prod

## Generate the config file and add it to the public folder
# RUN sh gen_config.sh && mv config.json dist/public

### STAGE 2: Setup ###

FROM nginx:1.17-alpine

# defer until SSL integrated, need to get package
# RUN openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html
# COPY --from=builder /ng-app/gen_config.sh /
COPY --from=builder /ng-app/docker-start.sh /
COPY --from=builder /ng-app/gulpfile.js /usr/share/nginx/html/public/

## Revove the 'assets' folder that got copied
# Can't yet: `assets` is referenced in 2 places:
#  * header.component.ts:13
#  * app.component.ts:9
#RUN rm -rf /usr/share/nginx/html/assets

# required to update config.json on startup
RUN apk add --update nodejs~=10.19
RUN apk add --update yarn
RUN yarn global add gulp

# install ssh server
RUN apk add openssh openrc \
     && echo "root:Docker!" | chpasswd

COPY sshd_config /etc/ssh/

# auto start ssh on startup
# RUN rc-update add sshd

# generate keys...
RUN /usr/bin/ssh-keygen -A

EXPOSE 80 2222

CMD ["./docker-start.sh"]
