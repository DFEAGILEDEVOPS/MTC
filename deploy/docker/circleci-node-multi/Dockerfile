# This is a custom dockerfile to allow us to run multiple versions of node
#  +nvm
FROM circleci/node:14.18.1-browsers
RUN curl -s -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
RUN /bin/bash -c "export NVM_DIR=\${HOME}/.nvm && source \${NVM_DIR}/nvm.sh && nvm install v12.18.2"
RUN /bin/bash -c "export NVM_DIR=\${HOME}/.nvm && source \${NVM_DIR}/nvm.sh && nvm install v14.18.1"
