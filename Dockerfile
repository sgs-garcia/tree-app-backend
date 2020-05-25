FROM node:lts-alpine as build-stage
COPY . .
RUN npm ci
RUN npm run build

FROM node:lts-alpine
WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=build-stage dist ./
RUN npm ci --only=production

CMD ["node", "./app.js"]
