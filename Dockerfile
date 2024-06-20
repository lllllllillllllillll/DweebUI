FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm install pm2 -g
COPY . /app
EXPOSE 8000
CMD ["pm2-runtime", "server.js"]