FROM node:21-alpine

ENV NODE_ENV=production
ENV DOCKER_BUILDKIT=1

WORKDIR /app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


USER root

COPY . .

EXPOSE 8000

CMD ["node", "server.js"]
