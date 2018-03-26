FROM node:8.4.0

# install yarn
# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
# RUN sudo apt-get update && sudo apt-get install yarn

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN rm -rf ./node_modules
RUN yarn install --ignore-engines
RUN ./node_modules/.bin/gulp build
RUN yarn global add pm2

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
# CMD [ "npm", "start" ]
CMD ["./docker-start.sh" ]
