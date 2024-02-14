FROM cimg/ruby:3.2.2-browsers
# Get the latest Google GPG key and import it
#RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo tee /etc/apt/trusted.gpg.d/google.com.asc
# Update the system
RUN sudo apt-get update && sudo apt-get upgrade
# Install freetds, and ruby bundler
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
