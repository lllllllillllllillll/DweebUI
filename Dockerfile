FROM node:23-alpine
ENV NODE_ENV=production
WORKDIR /dweebui
COPY package.json /dweebui
RUN npm install
RUN npm install pm2 -g
COPY . /dweebui
EXPOSE 8000
CMD ["pm2-runtime", "server.js"]