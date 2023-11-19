
FROM node:20-alpine

ENV NODE_ENV production

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the rest of the source files into the image.
COPY . .

# Run the application as a root user.
USER root

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD node app.js
