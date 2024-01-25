FROM ubuntu:20.04

RUN apt update -y && apt install -y git curl
RUN curl https://mise.jdx.dev/install.sh | MISE_INSTALL_PATH=/usr/local/bin/mise sh
ENV PATH=$PATH:/root/.local/share/mise/shims
