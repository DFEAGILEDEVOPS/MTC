ARG RUBY_PATH=/usr/local/
ARG RUBY_VERSION=2.7.7

FROM ubuntu:20.04 AS rubybuild

# install build tools
RUN apt-get update \
&&  apt-get upgrade -y --force-yes \
&&  apt-get install -y --force-yes \
    libssl-dev \
    libreadline-dev \
    zlib1g-dev \
    wget \
    curl \
    git \
    build-essential \
&&  apt-get clean \
&&  rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

ARG RUBY_PATH
ARG RUBY_VERSION
RUN git clone git://github.com/rbenv/ruby-build.git $RUBY_PATH/plugins/ruby-build \
&&  $RUBY_PATH/plugins/ruby-build/install.sh
RUN ruby-build $RUBY_VERSION $RUBY_PATH

FROM ubuntu:20.04
ARG RUBY_PATH
ENV PATH $RUBY_PATH/bin:$PATH
RUN apt-get update && \
    apt-get install -y \
        git \
        curl
COPY --from=rubybuild $RUBY_PATH $RUBY_PATH
ENTRYPOINT [ "/bin/bash" ]
