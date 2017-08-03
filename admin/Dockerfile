FROM node:alpine
MAINTAINER Jon Shipley <js@ovix.co.uk>
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN ./node_modules/.bin/gulp build

# ------------------------
# SSH Server support
# ------------------------
# COPY init_container.sh /bin/

# RUN apt-get update \ 
#   && apt-get install -y --no-install-recommends openssh-server \
#   && echo "root:Docker!" | chpasswd \
#   && chmod 755 /bin/init_container.sh

# COPY sshd_config.docker /etc/ssh/sshd_config
# EXPOSE 2222 80
# CMD ["/bin/init_container.sh"]
# -------------------------

EXPOSE 3001
CMD [ "npm", "start" ]