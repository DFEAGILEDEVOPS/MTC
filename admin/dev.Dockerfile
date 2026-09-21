FROM node:20.18.0
EXPOSE 3001 2222
RUN mkdir -p /mtc/admin
WORKDIR /mtc/admin
CMD ./docker-start-dev.sh
