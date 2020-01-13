FROM node:10.16.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn install --ignore-engines --frozen-lockfile
RUN yarn global add pm2

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
      && apt-get install -y --no-install-recommends dialog openssh-server \
	    && echo "$SSH_PASSWD" | chpasswd

COPY sshd_config /etc/ssh/

EXPOSE 3001 2222

RUN chmod u+x ./docker-start.sh

CMD ./docker-start.sh
