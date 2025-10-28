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

# Install serve for production static serving
RUN npm install -g serve

# Railway sets PORT dynamically
EXPOSE 8080

# Ensure runtime also has the API base (vite build embeds it)
ENV VITE_API_BASE=${VITE_API_BASE}
CMD ["sh", "-c", "serve -s dist -l 0.0.0.0:$PORT"]
