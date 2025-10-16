
FROM nginx:1.29.2-alpine

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

# delete default webroot
RUN rm -rf /usr/share/nginx/html
# copy in public assets from admin app
COPY ./assets /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
