FROM node:8

# install yarn
# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
# RUN sudo apt-get update && sudo apt-get install yarn

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN rm -rf ./node_modules
RUN yarn install --production --ignore-engines
RUN yarn global add pm2

# Show current folder structure in logs
RUN ls -al

EXPOSE 3003
CMD [ "pm2-docker", "./index.js" ]
