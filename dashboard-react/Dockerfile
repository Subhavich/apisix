FROM node:latest

WORKDIR /app

# Only install dependencies here
COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
