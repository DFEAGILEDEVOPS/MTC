### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:20-alpine AS builder

# `yarn install` needs to be able to find `git` for lz-string which uses a github.com URL for the version.
RUN apk update && \
    apk upgrade && \
    apk add git && \
    apk add alpine-sdk python3 py3-distutils-extra py3-pip

COPY package.json .
COPY yarn.lock .

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN yarn install --frozen-lockfile --ignore-engines && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN yarn build:prod

### STAGE 2: Setup ###

FROM nginx:stable-alpine

# defer until SSL integrated, need to get package
# RUN openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

## Copy over the main nginx.conf - this includes everything under conf.d/*
COPY nginx/nginx.conf /etc/nginx/
## Copy over the unsupported browsers routing
COPY nginx/browsers-map.conf /etc/nginx/
## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html
COPY --from=builder /ng-app/gen_config.sh /
COPY --from=builder /ng-app/docker-start.sh /

# Copy over the unsupported-browser.html, which is not in the dist folder
COPY --from=builder /ng-app/unsupported /usr/share/nginx/html/unsupported

# Copy over the custom error pages, which are not in the dist folder
COPY --from=builder /ng-app/error /usr/share/nginx/html/error

# install ssh server
# Credentials are for Azure / Kudu - don't change them.
RUN apk add openssh openrc \
     && echo "root:Docker!" | chpasswd

COPY sshd_config /etc/ssh/

# auto start ssh on startup
# RUN rc-update add sshd

# generate keys...
RUN /usr/bin/ssh-keygen -A

EXPOSE 80 2222

# docker-start.sh will
#  * start sshd
#  * generate a new config.json for the pupil-app to use using Azure env vars injected into the docker container
#  * inject the AZURE_ACCOUNT_NAME into the fallback queue system that uses nginx to submit the completed check
#  * start nginx
CMD ["./docker-start.sh"]
