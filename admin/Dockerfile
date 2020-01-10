FROM node:10.16.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn install --ignore-engines --frozen-lockfile
# RUN ./node_modules/.bin/gulp build
RUN yarn global add pm2

# todo - add pm2 logging setup

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
        && apt-get install -y --no-install-recommends dialog \
        && apt-get update \
	&& apt-get install -y --no-install-recommends openssh-server \
	&& echo "$SSH_PASSWD" | chpasswd

COPY sshd_config /etc/ssh/
COPY init.sh /usr/local/bin/

EXPOSE 3001 2222

RUN chmod u+x ./wait-sqldb.sh
RUN chmod u+x ./docker-start.sh

CMD ./wait-sqldb.sh && ./docker-start.sh
