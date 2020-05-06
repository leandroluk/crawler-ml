# base image
FROM mhart/alpine-node:latest

# labels
LABEL maintainer "Leandro Santiago Gomes <leandroluk@gmail.com>" 

# env variables
ENV TZ      = America/Sao_Paulo \
    NODE_ENV= prod\
    PORT    = 3000 \
    WORKDIR = /opt/crawler-ml

# set root path
WORKDIR ${WORKDIR}

# copy container files
COPY package.json package-lock.json /src  ${WORKDIR}

# install & tree-shacking deps
RUN npm ci --prod

# expose port to make acessible
EXPOSE ${PORT}

# run project
CMD node ${WORKDIR}/src/index.js
