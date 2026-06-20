FROM node:20-slim

RUN apt-get update && apt-get install -y curl git python3 build-essential
RUN curl https://install.meteor.com/ | sh

WORKDIR /app

COPY app/ .

ENV METEOR_ALLOW_SUPERUSER=true

RUN meteor build --directory /build --allow-superuser

WORKDIR /build/bundle/programs/server
RUN npm install

WORKDIR /build/bundle

ENV PORT=8080
EXPOSE 8080

CMD ["node", "main.js"]