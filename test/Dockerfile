FROM ruby:2.4.0

COPY ./install-freetds.sh .
RUN ./install-freetds.sh

# throw errors if Gemfile has been modified since Gemfile.lock
RUN bundle config --global frozen 1

WORKDIR /usr/src/app/admin

COPY /admin .

RUN bundle install

CMD ["cucumber"]
