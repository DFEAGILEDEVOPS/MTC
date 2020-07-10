# This is a custom dockerfile to allow us to run multiple versions of node
#  +nvm
FROM circleci/node:10-browsers
RUN curl -s -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
RUN /bin/bash -c "export NVM_DIR=\${HOME}/.nvm && source \${NVM_DIR}/nvm.sh && nvm install v10.14.1"
RUN /bin/bash -c "export NVM_DIR=\${HOME}/.nvm && source \${NVM_DIR}/nvm.sh && nvm install v12.18.2"

