FROM node:18.20.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn install --ignore-engines --frozen-lockfile
RUN yarn build
RUN yarn global add pm2
# remove and reinstall node_modules in prod only mode
RUN rm -rf ./node_modules
RUN yarn install --ignore-engines --frozen-lockfile --production


# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
      && apt-get install -y --no-install-recommends dialog openssh-server \
	    && echo "$SSH_PASSWD" | chpasswd

COPY sshd_config /etc/ssh/

EXPOSE 3001 2222

CMD ./docker-start.sh
