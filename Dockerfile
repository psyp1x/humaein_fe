FROM node:20-alpine
WORKDIR /app

# Accept API base at build time for Vite
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .

# Build with the provided VITE_ env
RUN npm run build

EXPOSE 5173

# Ensure runtime also has the API base (vite preview only uses built assets, but env kept for clarity)
ENV VITE_API_BASE=${VITE_API_BASE}
CMD ["npm", "run", "preview"]
