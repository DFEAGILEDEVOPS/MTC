FROM node:10.16.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
RUN yarn install --ignore-engines --frozen-lockfile

COPY . .
RUN yarn build
RUN yarn global add pm2

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
        && apt-get install -y --no-install-recommends dialog \
        && apt-get update \
	&& apt-get install -y --no-install-recommends openssh-server \
	&& echo "$SSH_PASSWD" | chpasswd

COPY sshd_config /etc/ssh/

EXPOSE 3003 2222

RUN chmod u+x ./docker-start.sh

CMD ["./docker-start.sh" ]
