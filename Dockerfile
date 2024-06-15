FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 8000
CMD ["node", "server.js"]