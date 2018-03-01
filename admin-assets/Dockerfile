
FROM nginx:1.13.3-alpine

# delete default webroot
RUN rm -rf /usr/share/nginx/html
# copy in public assets from admin app
COPY ./assets /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
