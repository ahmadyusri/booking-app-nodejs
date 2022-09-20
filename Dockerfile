ARG NODE_IMAGE=node:18-alpine

FROM $NODE_IMAGE AS base
RUN npm i -g pm2
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

FROM dependencies AS test
RUN node ace test

FROM test AS build
RUN node ace build --production

FROM base AS production
USER root
COPY --chown=root:root --from=dependencies /home/node/app/etc/docker-entrypoint-app.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint-app.sh

USER node
COPY --chown=node:node --from=build /home/node/app/build .

ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0

COPY --chown=node:node ./package*.json ./
RUN npm ci --production

ENTRYPOINT ["/bin/sh", "/usr/local/bin/docker-entrypoint-app.sh"]
