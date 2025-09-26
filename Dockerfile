FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
