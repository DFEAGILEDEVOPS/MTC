FROM node:18.20.4-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .

RUN apk update && apk upgrade
RUN apk add git

RUN yarn install --ignore-engines --frozen-lockfile
RUN yarn build
RUN yarn global add pm2

# remove and reinstall node_modules in prod only mode
RUN /bin/rm -rf ./node_modules
RUN yarn install --ignore-engines --frozen-lockfile --production

# ssh and required binaries
ENV SSH_PASSWD "root:Docker!"
RUN apk update && apk upgrade \
      && apk add dialog openssh-server openssh-keygen git \
	    && echo "$SSH_PASSWD" | chpasswd

COPY sshd_config /etc/ssh/
# Make sure we get fresh keys
RUN /bin/rm -rf /etc/ssh/ssh_host_rsa_key /etc/ssh/ssh_host_dsa_key
# Create new keys
RUN /usr/bin/ssh-keygen -A
# ssh-keygen may create DSA keys but:
# "Never use DSA or ECDSA"
# https://security.stackexchange.com/a/46781/25661
RUN /bin/rm -f /etc/ssh/*_dsa_key /etc/ssh/*_dsa_key.pub
RUN /bin/rm -f /etc/ssh/*_ecdsa_key /etc/ssh/*_ecdsa_key.pub
RUN /bin/rm -f /etc/ssh/*.pub
EXPOSE 3001 2222
CMD ["/usr/src/app/docker-start.sh"]
