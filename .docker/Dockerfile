FROM debian:latest

RUN apt update -y && apt install curl bash wget git -y

# install mise
RUN wget -O - https://mise.jdx.dev/install.sh | MISE_INSTALL_PATH=/usr/local/bin/mise sh
ENV PATH=$PATH:/root/.local/share/mise/shims

# install knope
RUN wget https://github.com/knope-dev/knope/releases/download/v0.16.1/knope-x86_64-unknown-linux-musl.tgz &&\
    tar -xvzf knope-x86_64-unknown-linux-musl.tgz && rm knope-x86_64-unknown-linux-musl.tgz &&\
    mv ./knope-x86_64-unknown-linux-musl/knope /usr/local/bin/knope &&\
    rm -rf ./knope-x86_64-unknown-linux-musl

# install chrome dependencies
RUN apt install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

# install project tools
ENV MISE_VERBOSE=1
ENV MISE_DATA_DIR=/.mise
ENV PATH=$MISE_DATA_DIR/shims:$PATH

COPY ../.mise.toml /root/.config/mise.toml

RUN mise install --cd /root --yes
