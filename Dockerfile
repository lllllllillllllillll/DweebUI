FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 8000
CMD node server.js