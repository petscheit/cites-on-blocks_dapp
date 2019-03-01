FROM node:8.15.0-jessie

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

CMD [ "npm", "run-script", "demo" ]