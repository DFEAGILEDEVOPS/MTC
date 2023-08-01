FROM node:18.12.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY dist ./dist
COPY pm2.json .
COPY docker-start.sh .
COPY package.json .
RUN yarn install --ignore-engines --frozen-lockfile --production

RUN yarn global add pm2

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
      && apt-get install -y --no-install-recommends dialog openssh-server \
	    && echo "$SSH_PASSWD" | chpasswd

COPY sshd_config /etc/ssh/

EXPOSE 3003 2222

CMD ["./docker-start.sh" ]
