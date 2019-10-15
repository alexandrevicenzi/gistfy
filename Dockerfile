FROM node:latest

RUN mkdir -p /gistify

WORKDIR /gistify

ADD package.json /gistify/package.json

RUN npm install
RUN npm install --dev
