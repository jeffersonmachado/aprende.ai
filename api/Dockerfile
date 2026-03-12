FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache wget

COPY package.json ./
RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 3015
CMD ["sh", "entrypoint.sh"]
