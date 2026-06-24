FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev --silent

COPY . .

EXPOSE 3003

CMD ["node", "server.js"]