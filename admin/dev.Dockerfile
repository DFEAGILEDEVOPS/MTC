FROM node:12.18.2

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
      && apt-get install -y --no-install-recommends dialog openssh-server \
	    && echo "$SSH_PASSWD" | chpasswd

COPY sshd_config /etc/ssh/

EXPOSE 3001 2222

RUN mkdir -p /mtc/admin
WORKDIR /mtc/admin

CMD ./docker-start.sh
