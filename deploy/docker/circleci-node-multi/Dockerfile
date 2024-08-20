# This is a custom dockerfile to allow us to run multiple versions of node
# https://circleci.com/developer/images/image/cimg/node
#  +nvm
FROM cimg/node:16.17.1-browsers
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN /bin/bash -c "export NVM_DIR=\${HOME}/.nvm && source \${NVM_DIR}/nvm.sh && nvm install v18.12.0"
RUN /bin/bash -c "export NVM_DIR=\${HOME}/.nvm && source \${NVM_DIR}/nvm.sh && nvm install v18.20.4"
