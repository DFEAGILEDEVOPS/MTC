FROM node:25.2.1

RUN mkdir -p /mtc/pupil-spa
WORKDIR /mtc/pupil-spa

EXPOSE 80 4200 2222

CMD ["./docker-start-dev.sh"]
