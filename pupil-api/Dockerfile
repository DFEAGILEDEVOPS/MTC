FROM node:18.20.4-alpine

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
RUN apk update && apk upgrade \
      && apk add dialog openssh-server openssh-keygen \
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
EXPOSE 3003 2222
CMD ["/usr/src/app/docker-start.sh"]
