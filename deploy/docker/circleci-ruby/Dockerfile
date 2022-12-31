FROM circleci/ruby:2.7.6
RUN sudo apt-get update && sudo apt-get upgrade
RUN gem install bundler
ENV FREETDS_VERSION='1.2.12'
RUN echo $FREETDS_VERSION
RUN cd $HOME && mkdir src && cd src \
&& curl -O -s ftp://ftp.freetds.org/pub/freetds/stable/freetds-${FREETDS_VERSION}.tar.gz \
&& tar xzf freetds-${FREETDS_VERSION}.tar.gz \
&& cd freetds-${FREETDS_VERSION} \
&& ./configure \
&& make \
&& sudo make install \
&& cd $HOME && rm -rf src
