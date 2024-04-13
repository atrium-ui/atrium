FROM debian:latest

RUN apt update -y && apt install curl bash wget git -y

RUN wget -O - https://mise.jdx.dev/install.sh | MISE_INSTALL_PATH=/usr/local/bin/mise sh
ENV PATH=$PATH:/root/.local/share/mise/shims

RUN wget https://github.com/knope-dev/knope/releases/download/v0.16.1/knope-x86_64-unknown-linux-musl.tgz &&\
    tar -xvzf knope-x86_64-unknown-linux-musl.tgz && rm knope-x86_64-unknown-linux-musl.tgz &&\
    mv ./knope-x86_64-unknown-linux-musl/knope /usr/local/bin/knope &&\
    rm -rf ./knope-x86_64-unknown-linux-musl
