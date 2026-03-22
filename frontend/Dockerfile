FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund --prefer-offline
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
