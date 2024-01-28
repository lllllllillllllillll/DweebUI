FROM node:21-alpine
ENV NODE_ENV=production

ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM" > /log

WORKDIR /app

RUN chown node:node /app
USER node

COPY package.json package-lock.json* /app/
RUN npm ci && npm cache clean --force
COPY . /app
EXPOSE 8000
CMD ["node", "server.js"]