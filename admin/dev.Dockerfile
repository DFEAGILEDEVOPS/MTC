FROM node:14.18.1
EXPOSE 3001 2222
RUN mkdir -p /mtc/admin
WORKDIR /mtc/admin
CMD ./docker-start-dev.sh
