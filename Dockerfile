
ARG NODE_VERSION=20.0.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production

WORKDIR /app


RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm 

# Run the application as a root user.
USER root

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD node app.js

