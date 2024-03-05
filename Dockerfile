FROM node:20-buster
WORKDIR /app
RUN mkdir -p /app/data
COPY package*.json ./
RUN npm install
COPY . .
ENV DEKART_DB_PATH=/app/data/dekart.db